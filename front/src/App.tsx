import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { DefaultLayout } from '@/ui/layout/components/DefaultLayout';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { CreateProfile } from '~/pages/auth/CreateProfile';
import { CreateWorkspace } from '~/pages/auth/CreateWorkspace';
import { SignInUp } from '~/pages/auth/SignInUp';
import { VerifyEffect } from '~/pages/auth/VerifyEffect';
import { Companies } from '~/pages/companies/Companies';
import { CompanyShow } from '~/pages/companies/CompanyShow';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { PersonShow } from '~/pages/people/PersonShow';
import { SettingsExperience } from '~/pages/settings/SettingsExperience';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';
import { SettingsWorkspace } from '~/pages/settings/SettingsWorkspace';
import { SettingsWorkspaceMembers } from '~/pages/settings/SettingsWorkspaceMembers';
import { Tasks } from '~/pages/tasks/Tasks';

import { CommandMenuEffect } from './effect-components/CommandMenuEffect';
import { GotoHotkeysEffect } from './effect-components/GotoHotkeysEffect';
import { ImpersonateEffect } from './pages/impersonate/ImpersonateEffect';
import { NotFound } from './pages/not-found/NotFound';
import { getPageTitleFromPath } from './utils/title-utils';

export const App = () => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitleFromPath(pathname);

  return (
    <>
      <PageTitle title={pageTitle} />
      <GotoHotkeysEffect />
      <CommandMenuEffect />
      <DefaultLayout>
        <Routes>
          <Route path={AppPath.Verify} element={<VerifyEffect />} />
          <Route path={AppPath.SignIn} element={<SignInUp />} />
          <Route path={AppPath.SignUp} element={<SignInUp />} />
          <Route path={AppPath.Invite} element={<SignInUp />} />
          <Route path={AppPath.CreateWorkspace} element={<CreateWorkspace />} />
          <Route path={AppPath.CreateProfile} element={<CreateProfile />} />
          <Route path="/" element={<Navigate to={AppPath.CompaniesPage} />} />
          <Route path={AppPath.PeoplePage} element={<People />} />
          <Route path={AppPath.PersonShowPage} element={<PersonShow />} />
          <Route path={AppPath.CompaniesPage} element={<Companies />} />
          <Route path={AppPath.CompanyShowPage} element={<CompanyShow />} />
          <Route path={AppPath.TasksPage} element={<Tasks />} />
          <Route path={AppPath.Impersonate} element={<ImpersonateEffect />} />

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
                  element={<SettingsWorkspace />}
                />
              </Routes>
            }
          />
          <Route path={AppPath.NotFoundWildcard} element={<NotFound />} />
        </Routes>
      </DefaultLayout>
    </>
  );
};
