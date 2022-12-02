import React from 'react';
import Tasks from './pages/Tasks';
import History from './pages/History';
import Performance from './pages/Performance';
import AppLayout from './layout/AppLayout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Tasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
