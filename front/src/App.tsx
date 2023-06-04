import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from './modules/auth/components/RequireAuth';
import { getUserIdFromToken } from './modules/auth/services/AuthService';
import { AppLayout } from './modules/ui/layout/AppLayout';
import { mapToUser, User } from './modules/users/interfaces/user.interface';
import { useGetCurrentUserQuery } from './modules/users/services';
import AuthCallback from './pages/auth/Callback';
import { Login } from './pages/auth/Login';
import { Companies } from './pages/companies/Companies';
import { Opportunities } from './pages/opportunities/Opportunities';
import { People } from './pages/people/People';

export function App() {
  const [user, setUser] = useState<User | undefined>(undefined);

  const userIdFromToken = getUserIdFromToken();
  const { data } = useGetCurrentUserQuery(userIdFromToken);

  useEffect(() => {
    if (data?.users[0]) {
      setUser(mapToUser(data?.users[0]));
    }
  }, [data]);

  return (
    <>
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
    </>
  );
}
