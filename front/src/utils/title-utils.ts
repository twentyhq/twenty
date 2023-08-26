import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';

export function getPageTitleFromPath(pathname: string): string {
  switch (pathname) {
    case AppPath.Verify:
      return 'Verify';
    case AppPath.SignIn:
      return 'Sign In';
    case AppPath.SignUp:
      return 'Sign Up';
    case AppPath.Invite:
      return 'Invite';
    case AppPath.CreateWorkspace:
      return 'Create Workspace';
    case AppPath.CreateProfile:
      return 'Create Profile';
    case AppPath.PeoplePage:
      return 'People';
    case AppPath.CompaniesPage:
      return 'Companies';
    case AppPath.TasksPage:
      return 'Tasks';
    case AppPath.OpportunitiesPage:
      return 'Opportunities';
    case `${AppBasePath.Settings}/${SettingsPath.ProfilePage}`:
      return 'Profile Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Experience}`:
      return 'Experience';
    case `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`:
      return 'Workspace Members Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Workspace}`:
      return 'Workspace Settings';
    default:
      return 'Twenty';
  }
}
