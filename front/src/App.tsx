import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from './modules/auth/components/RequireAuth';
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
        path="*"
        element={
          <RequireAuth>
            <Routes>
              <Route path="" element={<Navigate to="/people" replace />} />
              <Route path="people" element={<People />} />
              <Route path="companies" element={<Companies />} />
              <Route path="opportunities" element={<Opportunities />} />
            </Routes>
          </RequireAuth>
        }
      />
      <Route
        path="auth/*"
        element={
          <Routes>
            <Route path="callback" element={<AuthCallback />} />
            <Route path="login" element={<Login />} />
          </Routes>
        }
      />
      <Route
        path="settings/*"
        element={
          <Routes>
            <Route path="profile" element={<SettingsProfile />} />
          </Routes>
        }
      />
    </Routes>
  );
}
