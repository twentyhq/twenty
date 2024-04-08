import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';

export const getPageTitleFromPath = (pathname: string): string => {
  switch (pathname) {
    case AppPath.Verify:
      return 'Verify';
    case AppPath.SignInUp:
      return 'Sign in or Create an account';
    case AppPath.Invite:
      return 'Invite';
    case AppPath.CreateWorkspace:
      return 'Create Workspace';
    case AppPath.CreateProfile:
      return 'Create Profile';
    case AppPath.TasksPage:
      return 'Tasks';
    case AppPath.OpportunitiesPage:
      return 'Opportunities';
    case `${AppBasePath.Settings}/${SettingsPath.ProfilePage}`:
      return 'Profile';
    case `${AppBasePath.Settings}/${SettingsPath.Appearance}`:
      return 'Appearance';
    case `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`:
      return 'Workspace Members';
    case `${AppBasePath.Settings}/${SettingsPath.Workspace}`:
      return 'Workspace';
    default:
      return 'Twenty';
  }
};
