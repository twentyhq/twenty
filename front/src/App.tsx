import { Navigate, Route, Routes } from 'react-router-dom';

import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { DefaultLayout } from '@/ui/layout/components/DefaultLayout';
import { CreateProfile } from '~/pages/auth/CreateProfile';
import { CreateWorkspace } from '~/pages/auth/CreateWorkspace';
import { Verify } from '~/pages/auth/Verify';
import { Companies } from '~/pages/companies/Companies';
import { CompanyShow } from '~/pages/companies/CompanyShow';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { PersonShow } from '~/pages/people/PersonShow';
import { SettingsExperience } from '~/pages/settings/SettingsExperience';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';
import { SettingsWorksapce } from '~/pages/settings/SettingsWorkspace';
import { SettingsWorkspaceMembers } from '~/pages/settings/SettingsWorkspaceMembers';
import { AppInternalHooks } from '~/sync-hooks/AppInternalHooks';

import { SignInUp } from './pages/auth/SignInUp';

export function App() {
  return (
    <>
      <AppInternalHooks />
      <DefaultLayout>
        <Routes>
          <Route path={AppPath.Verify} element={<Verify />} />
          <Route path={AppPath.SignIn} element={<SignInUp />} />
          <Route path={AppPath.SignUp} element={<SignInUp />} />
          <Route path={AppPath.Invite} element={<SignInUp />} />
          <Route path={AppPath.CreateWorkspace} element={<CreateWorkspace />} />
          <Route path={AppPath.CreateProfile} element={<CreateProfile />} />
          <Route
            path=""
            element={<Navigate to={AppPath.CompaniesPage} replace />}
          />
          <Route path={AppPath.PeoplePage} element={<People />} />
          <Route path={AppPath.PersonShowPage} element={<PersonShow />} />
          <Route path={AppPath.CompaniesPage} element={<Companies />} />
          <Route path={AppPath.CompanyShowPage} element={<CompanyShow />} />

          <Route path={AppPath.OpportunitiesPage} element={<Opportunities />} />
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <Routes>
                <Route
                  path={SettingsPath.ProfilePage}
                  element={<SettingsProfile />}
                />
                <Route
                  path={SettingsPath.Experience}
                  element={<SettingsExperience />}
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
      </DefaultLayout>
    </>
  );
}
