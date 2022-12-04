import React from 'react';
import Tasks from './pages/tasks/Tasks';
import History from './pages/History';
import Performances from './pages/Performances';
import AppLayout from './layout/AppLayout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Tasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/performances" element={<Performances />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
