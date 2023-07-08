import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

import { RequireOnboarded } from '@/auth/components/RequireOnboarded';
import { RequireOnboarding } from '@/auth/components/RequireOnboarding';
import { AuthModal } from '@/auth/components/ui/Modal';
import { AuthLayout } from '@/ui/layout/AuthLayout';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { CreateProfile } from '~/pages/auth/CreateProfile';
import { CreateWorkspace } from '~/pages/auth/CreateWorkspace';
import { Index } from '~/pages/auth/Index';
import { PasswordLogin } from '~/pages/auth/PasswordLogin';
import { Verify } from '~/pages/auth/Verify';
import { Companies } from '~/pages/companies/Companies';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';
import { SettingsWorkspaceMembers } from '~/pages/settings/SettingsWorkspaceMembers';

import { CompanyShow } from './pages/companies/CompanyShow';
import { AppInternalHooks } from './AppInternalHooks';

/**
 * AuthRoutes is used to allow transitions between auth pages with framer-motion.
 */
function AuthRoutes() {
  const location = useLocation();

  return (
    <LayoutGroup>
      <AuthModal>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="" element={<Index />} />
            <Route path="callback" element={<Verify />} />
            <Route path="password-login" element={<PasswordLogin />} />
            <Route path="create/workspace" element={<CreateWorkspace />} />
            <Route path="create/profile" element={<CreateProfile />} />
          </Routes>
        </AnimatePresence>
      </AuthModal>
    </LayoutGroup>
  );
}

export function App() {
  return (
    <>
      <AppInternalHooks />
      <DefaultLayout>
        <Routes>
          <Route
            path="auth/*"
            element={
              <RequireOnboarding>
                <AuthLayout>
                  <AuthRoutes />
                </AuthLayout>
              </RequireOnboarding>
            }
          />
          <Route
            path="*"
            element={
              <RequireOnboarded>
                <Routes>
                  <Route path="" element={<Navigate to="/people" replace />} />
                  <Route path="people" element={<People />} />
                  <Route path="companies" element={<Companies />} />
                  <Route
                    path="companies/:companyId"
                    element={<CompanyShow />}
                  />

                  <Route path="opportunities" element={<Opportunities />} />
                  <Route
                    path="settings/*"
                    element={
                      <Routes>
                        <Route path="profile" element={<SettingsProfile />} />
                        <Route
                          path="workspace-members"
                          element={<SettingsWorkspaceMembers />}
                        />
                      </Routes>
                    }
                  />
                </Routes>
              </RequireOnboarded>
            }
          />
        </Routes>
      </DefaultLayout>
    </>
  );
}
