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

export function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AppLayout>
            <RequireAuth>
              <Routes>
                <Route path="/" element={<Navigate to="/people" replace />} />
                <Route path="/people" element={<People />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/login" element={<Login />} />
              </Routes>
            </RequireAuth>
          </AppLayout>
        }
      />
      <Route
        path="auth/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="callback" element={<AuthCallback />} />
              <Route path="login" element={<Login />} />
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
            </Routes>
          </SettingsLayout>
        }
      />
    </Routes>
  );
}
