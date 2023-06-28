import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@/auth/components/RequireAuth';
import { RequireNotAuth } from '@/auth/components/RequireNotAuth';
import { useTrackPageView } from '@/events/hooks/useTrackPageView';
import { useGoToHotkeys } from '@/hotkeys/hooks/useGoToHotkeys';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { Index } from '~/pages/auth/Index';
import { PasswordLogin } from '~/pages/auth/PasswordLogin';
import { Verify } from '~/pages/auth/Verify';
import { Companies } from '~/pages/companies/Companies';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';

export function App() {
  useGoToHotkeys('p', '/people');
  useGoToHotkeys('c', '/companies');
  useGoToHotkeys('o', '/opportunities');
  useGoToHotkeys('s', '/settings/profile');

  useTrackPageView();

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
