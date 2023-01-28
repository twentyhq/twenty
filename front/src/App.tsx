import React from 'react';
import Inbox from './pages/inbox/Inbox';
import Contacts from './pages/Contacts';
import Insights from './pages/Insights';
import AuthCallback from './pages/AuthCallback';
import AppLayout from './layout/AppLayout';
import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    users {
      id
      email
      first_name
      last_name
      tenant {
        id
        name
      }
    }
  }
`;

function App() {
  const { data } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
  });
  const user = data?.users[0];

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
