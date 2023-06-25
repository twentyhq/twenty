import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@/auth/components/RequireAuth';
import { RequireNotAuth } from '@/auth/components/RequireNotAuth';
import { useGotoHotkey } from '@/hotkeys/hooks/useGotoHotkey';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { Index } from '~/pages/auth/Index';
import { PasswordLogin } from '~/pages/auth/PasswordLogin';
import { Verify } from '~/pages/auth/Verify';
import { Companies } from '~/pages/companies/Companies';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';

export function App() {
  useGotoHotkey('p', '/people');
  useGotoHotkey('p', '/companies');
  useGotoHotkey('o', '/opportunities');
  useGotoHotkey('s', '/settings/profile');

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
            <RequireNotAuth>
              <Routes>
                <Route path="" element={<Index />} />
                <Route path="callback" element={<Verify />} />
                <Route path="password-login" element={<PasswordLogin />} />
              </Routes>
            </RequireNotAuth>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}
