import React from 'react';
import Tasks from './pages/Tasks';
import History from './pages/History';
import { Routes, Route } from 'react-router-dom';
import { css } from '@linaria/core';

const app = css`
  text-transform: uppercase;
`;

function App() {
  return (
    <div className={app}>
      <Routes>
        <Route path="/" element={<Tasks />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;
