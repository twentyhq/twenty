import React from 'react';
import Inbox from './pages/inbox/Inbox';
import Contacts from './pages/Contacts';
import Insights from './pages/Insights';
import AuthCallback from './pages/AuthCallback';
import AppLayout from './layout/AppLayout';
import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';
import { useGetProfile } from './hooks/profile/useGetProfile';

function App() {
  const { user } = useGetProfile();

  return (
    <AppLayout user={user}>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Inbox />
            </RequireAuth>
          }
        />
        <Route
          path="/contacts"
          element={
            <RequireAuth>
              <Contacts />
            </RequireAuth>
          }
        />
        <Route
          path="/insights"
          element={
            <RequireAuth>
              <Insights />
            </RequireAuth>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
