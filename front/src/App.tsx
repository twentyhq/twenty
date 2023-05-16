import React, { useEffect, useState } from 'react';
import People from './pages/people/People';
import Companies from './pages/companies/Companies';
import AuthCallback from './pages/auth/Callback';
import Login from './pages/auth/Login';
import AppLayout from './layout/AppLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import Opportunities from './pages/opportunities/Opportunities';
import { User, mapToUser } from './interfaces/user.interface';
import { useGetCurrentUserQuery } from './api/users';

function App() {
  const [user, setUser] = useState<User | undefined>(undefined);

  const { data } = useGetCurrentUserQuery();

  useEffect(() => {
    if (data?.users[0]) {
      setUser(mapToUser(data?.users[0]));
    }
  }, [data]);

  return (
    <div>
      {
        <AppLayout user={user}>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Navigate to="/people" replace />
                </RequireAuth>
              }
            />
            <Route
              path="/people"
              element={
                <RequireAuth>
                  <People />
                </RequireAuth>
              }
            />
            <Route
              path="/companies"
              element={
                <RequireAuth>
                  <Companies />
                </RequireAuth>
              }
            />
            <Route
              path="/opportunities"
              element={
                <RequireAuth>
                  <Opportunities />
                </RequireAuth>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/login" element={<Login />} />
          </Routes>
        </AppLayout>
      }
    </div>
  );
}

export default App;
