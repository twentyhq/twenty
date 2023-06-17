import { Navigate, Route, Routes } from 'react-router-dom';

import { DefaultLayout } from '@/ui/layout/DefaultLayout';

import { RequireAuth } from './modules/auth/components/RequireAuth';
import { Callback } from './pages/auth/Callback';
import { Index } from './pages/auth/Index';
import { Login } from './pages/auth/Login';
import { Companies } from './pages/companies/Companies';
import { Opportunities } from './pages/opportunities/Opportunities';
import { People } from './pages/people/People';
import { SettingsProfile } from './pages/settings/SettingsProfile';

export function App() {
  return (
    <DefaultLayout>
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
                <Route
                  path="settings/*"
                  element={
                    <Routes>
                      <Route path="profile" element={<SettingsProfile />} />
                    </Routes>
                  }
                />
              </Routes>
            </RequireAuth>
          }
        />
        <Route
          path="auth/*"
          element={
            <Routes>
              <Route path="" element={<Index />} />
              <Route path="callback" element={<Callback />} />
              <Route path="login" element={<Login />} />
            </Routes>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}
