import React from 'react';
import Inbox from './pages/inbox/Inbox';
import Contacts from './pages/Contacts';
import Insights from './pages/Insights';
import AppLayout from './layout/AppLayout';
import { Routes, Route } from 'react-router-dom';

function App() {
  const user = {
    id: 1,
    email: 'charles@twenty.com',
    first_name: 'Charles',
    last_name: 'Bochet',
  };

  return (
    <div>
      {
        <AppLayout user={user}>
          <Routes>
            <Route path="/" element={<Inbox />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </AppLayout>
      }
    </div>
  );
}

export default App;
