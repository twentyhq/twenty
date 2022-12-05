import React from 'react';
import Inbox from './pages/inbox/Inbox';
import Contacts from './pages/Contacts';
import Insights from './pages/Insights';
import AppLayout from './layout/AppLayout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Inbox />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
