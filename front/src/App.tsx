import { Navigate, Route, Routes } from 'react-router-dom';

import { SettingsLayout } from '@/ui/layout/SettingsLayout';

import { RequireAuth } from './modules/auth/components/RequireAuth';
import { AppLayout } from './modules/ui/layout/AppLayout';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Login } from './pages/auth/Login';
import { Companies } from './pages/companies/Companies';
import { Opportunities } from './pages/opportunities/Opportunities';
import { People } from './pages/people/People';
import { SettingsProfile } from './pages/settings/SettingsProfile';
import { SettingsWorkspace } from './pages/settings/SettingsWorkspace';

export function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AppLayout>
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
      />
      <Route
        path="settings/*"
        element={
          <SettingsLayout>
            <Routes>
              <Route path="profile" element={<SettingsProfile />} />
              <Route path="workspace" element={<SettingsWorkspace />} />
            </Routes>
          </SettingsLayout>
        }
      />
    </Routes>
  );
}
