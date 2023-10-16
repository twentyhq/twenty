import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { DefaultLayout } from '@/ui/layout/page/DefaultLayout';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { CommandMenuEffect } from '~/effect-components/CommandMenuEffect';
import { GotoHotkeysEffect } from '~/effect-components/GotoHotkeysEffect';
import { CreateProfile } from '~/pages/auth/CreateProfile';
import { CreateWorkspace } from '~/pages/auth/CreateWorkspace';
import { SignInUp } from '~/pages/auth/SignInUp';
import { VerifyEffect } from '~/pages/auth/VerifyEffect';
import { Companies } from '~/pages/companies/Companies';
import { CompanyShow } from '~/pages/companies/CompanyShow';
import { ImpersonateEffect } from '~/pages/impersonate/ImpersonateEffect';
import { NotFound } from '~/pages/not-found/NotFound';
import { Opportunities } from '~/pages/opportunities/Opportunities';
import { People } from '~/pages/people/People';
import { PersonShow } from '~/pages/people/PersonShow';
import { SettingsNewObject } from '~/pages/settings/data-model/SettingsNewObject';
import { SettingsObjectDetail } from '~/pages/settings/data-model/SettingsObjectDetail';
import { SettingsObjectEdit } from '~/pages/settings/data-model/SettingsObjectEdit';
import { SettingsObjects } from '~/pages/settings/data-model/SettingsObjects';
import { SettingsExperience } from '~/pages/settings/SettingsExperience';
import { SettingsProfile } from '~/pages/settings/SettingsProfile';
import { SettingsWorkspace } from '~/pages/settings/SettingsWorkspace';
import { SettingsWorkspaceMembers } from '~/pages/settings/SettingsWorkspaceMembers';
import { Tasks } from '~/pages/tasks/Tasks';
import { getPageTitleFromPath } from '~/utils/title-utils';

import { ObjectTablePage } from './pages/companies/ObjectsTable';
import { SettingsObjectNewFieldStep1 } from './pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldStep1';
import { SettingsObjectNewFieldStep2 } from './pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldStep2';

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
            path={AppPath.ObjectTablePage}
            element={
              <ObjectTablePage
                objectName="supplier"
                objectNameSingular="Supplier"
              />
            }
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
                <Route
                  path={SettingsPath.Objects}
                  element={<SettingsObjects />}
                />
                <Route
                  path={SettingsPath.ObjectDetail}
                  element={<SettingsObjectDetail />}
                />
                <Route
                  path={SettingsPath.ObjectEdit}
                  element={<SettingsObjectEdit />}
                />
                <Route
                  path={SettingsPath.NewObject}
                  element={<SettingsNewObject />}
                />
                <Route
                  path={SettingsPath.ObjectNewFieldStep1}
                  element={<SettingsObjectNewFieldStep1 />}
                />
                <Route
                  path={SettingsPath.ObjectNewFieldStep2}
                  element={<SettingsObjectNewFieldStep2 />}
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
