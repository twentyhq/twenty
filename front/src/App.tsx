import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

import { RequireOnboarded } from '@/auth/components/RequireOnboarded';
import { RequireOnboarding } from '@/auth/components/RequireOnboarding';
import { AuthModal } from '@/auth/components/ui/Modal';
import { Snackbar } from '@/ui/components/snack-bar/SnackBar';
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
import { PersonShow } from './pages/people/PersonShow';
import { SettingsWorksapce } from './pages/settings/SettingsWorkspace';
import { AppPath } from './sync-hooks/types/AppPath';
import { AuthPath } from './sync-hooks/types/AuthPath';
import { SettingsPath } from './sync-hooks/types/SettingsPath';
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
            <Route path={AuthPath.Index} element={<Index />} />
            <Route path={AuthPath.Callback} element={<Verify />} />
            <Route path={AuthPath.PasswordLogin} element={<PasswordLogin />} />
            <Route path={AuthPath.InviteLink} element={<PasswordLogin />} />
            <Route
              path={AuthPath.CreateWorkspace}
              element={<CreateWorkspace />}
            />
            <Route path={AuthPath.CreateProfile} element={<CreateProfile />} />
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
            path={AppPath.AuthCatchAll}
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
                  <Route
                    path=""
                    element={<Navigate to={AppPath.PeoplePage} replace />}
                  />
                  <Route path={AppPath.PeoplePage} element={<People />} />
                  <Route
                    path={AppPath.PersonShowPage}
                    element={<PersonShow />}
                  />
                  <Route path={AppPath.CompaniesPage} element={<Companies />} />
                  <Route
                    path={AppPath.CompanyShowPage}
                    element={<CompanyShow />}
                  />

                  <Route
                    path={AppPath.OpportunitiesPage}
                    element={<Opportunities />}
                  />
                  <Route
                    path={AppPath.SettingsCatchAll}
                    element={
                      <Routes>
                        <Route
                          path={SettingsPath.ProfilePage}
                          element={<SettingsProfile />}
                        />
                        <Route
                          path={SettingsPath.WorkspaceMembersPage}
                          element={<SettingsWorkspaceMembers />}
                        />
                        <Route
                          path={SettingsPath.Workspace}
                          element={<SettingsWorksapce />}
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
      <Snackbar isOpen={true} title="Test" variant="success" duration={5} />
    </>
  );
}
