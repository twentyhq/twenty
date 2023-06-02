import React, { useEffect, useState } from 'react';
import People from './pages/people/People';
import Companies from './pages/companies/Companies';
import AuthCallback from './pages/auth/Callback';
import Login from './pages/auth/Login';
import AppLayout from './layout/AppLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import Opportunities from './pages/opportunities/Opportunities';
import { User, mapToUser } from './interfaces/entities/user.interface';
import { useGetCurrentUserQuery } from './services/api/users';
import { getUserIdFromToken } from './services/auth/AuthService';
import { ThemeProvider } from '@emotion/react';
import { lightTheme, darkTheme } from './layout/styles/themes';
import { browserPrefersDarkMode } from './services/utils';

type AppProps = {
  userThemingEnabled?: boolean;
};

function App({ userThemingEnabled = true }: AppProps) {
  const [user, setUser] = useState<User | undefined>(undefined);

  const userIdFromToken = getUserIdFromToken();
  const { data } = useGetCurrentUserQuery(userIdFromToken);

  useEffect(() => {
    if (data?.users[0]) {
      setUser(mapToUser(data?.users[0]));
    }
  }, [data]);

  const defaultTheme = browserPrefersDarkMode() ? darkTheme : lightTheme;

  const app = (
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

  return (
    <>
      {userThemingEnabled ? (
        <ThemeProvider theme={defaultTheme}>{app}</ThemeProvider>
      ) : (
        app
      )}
    </>
  );
}

export default App;
