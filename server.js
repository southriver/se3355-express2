const express = require("express")
const app = express()
const bodyParser = require('body-parser'); // Import body-parser module
const router = express.Router()
const path = require('path');

app.set("view engine", "ejs")
app.use(express.static("public"))
// app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('example.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            db.run('CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, addr TEXT, city TEXT, pin TEXT)')
            console.log ("Table created successfully, if it didnt exist")
            console.log('Connected to the database.');
        }
});

app.get("/", (req,res) => {
    // res.sendStatus(500, "test error")
    // res.download("server.js")
    // res.json({message : "test json"})   
    res.sendFile(path.join(__dirname, 'public', 'index.html'));    
    // res.render("index", {name : "Ali"})
})

app.get("/enterNew", (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));    
})


app.get("/list", (req, res) => {
    const sql = "SELECT * FROM students"; 
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error executing query');
        }
        // Render the 'data' view with the fetched rows
        // res.render('data', { rows });
        res.json(rows);
    });
  })

app.post('/insert', (req, res) => {
    console.log(req.body);
    const { fullname, address, city, pin } = req.body;

    // Check if the required fields are provided
    if (!fullname) {
        return res.status(400).send('Name required.');
    }

    // Prepare the SQL statement for inserting data
    const sql = "INSERT INTO students (name, addr, city, pin) VALUES (?, ?, ?, ?)";
    const values = [fullname, address, city, pin];

    // Execute the SQL statement
    db.run(sql, values, function(err) {
        if (err) {
            console.error(err.message);
            return         res.json({'Message' : err.message});
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        // res.json({'Message' : 'Data inserted successfully.'});
        res.sendFile(path.join(__dirname, 'public', 'index.html'));         
    });
});

app.get("/delete/:id", (req, res) => {
    try {
      const { id } = req.params;
      const update = db
        .run(
          `DELETE FROM students where id = ?`,
          [id]
        );
        res.sendFile(path.join(__dirname, 'public', 'index.html'));  
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err,
        });
    }
  });

app.post('/update', (req, res) => {
    const { id, city } = req.body; // Assuming you're passing JSON data for updating
    try {
        const result = db.run(
        'UPDATE students SET city = $1 WHERE id = $2 RETURNING *',
        [city, id]
        );

        res.json({ success: true});  
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ success: false, error: 'Error updating row' });
    }
    });  
// const userRouter = require("./routes/users")
// app.use("/users", userRouter)

module.exports = router
app.listen(3000)