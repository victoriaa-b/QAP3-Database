const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;

app.use(express.json());

// connection to the database
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tasks_database",
  password: "tasks24!",
  port: "5432",
});

// need to create a table function
async function createTable() {
    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            status TEXT NOT NULL
            );`
        );
      console.log("The 'tasks' table has been created!");
    } catch (error) {
      console.error("Error! Couldn't create table:", error)
    }
}
// 
createTable();

// GET /tasks - Get all tasks
app.get('/tasks', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM tasks'); /// forgot to add table name
        response.json(result.rows);
    } catch (error) {
        console.error("Database error:", error); // log error to server
        response.status(500).json({error: "Database error! Couldn't get tasks. Please Try again."})
    }
  
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { description, status } = request.body; // remove id, as SERIAL says all need to be unique
    if ( !description || !status) { // make both required, also need to remove id
        return response.status(400).json({ error: "Description and status are required! " });
    }
    try {
        const result = await pool.query(
            'INSERT INTO tasks (desciption, status) VALUES ($1, $2) RETURNING *', [description, status] /// 1 and 2 are placeholders
        );
        response.status(201).json(result.rows[0]); // tasks was compeleted
    } catch (error) {
        console.error("Database error:", error);
        response.status(500).json({error: "Database error! Couldn't add a task. Please Try again."}) // error couldn't add a new task
    }
});


// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return response.status(404).json({ error: 'Task not found' });
    }
    task.status = status;
    response.json({ message: 'Task updated successfully' });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return response.status(404).json({ error: 'Task not found' });
    }
    response.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
