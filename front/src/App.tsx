import React from 'react';
import Tasks from './pages/Tasks';
import History from './pages/History';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Tasks />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;
