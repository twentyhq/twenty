import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';

export enum SettingsPageTitles {
  Accounts = 'Account - Settings',
  Experience = 'Experience - Settings',
  Profile = 'Profile - Settings',
  Objects = 'Data model - Settings',
  Members = 'Members - Settings',
  Developers = 'Developers - Settings',
  Integration = 'Integrations - Settings',
  ServerlessFunctions = 'Functions - Settings',
  General = 'General - Settings',
  Default = 'Settings',
}

enum SettingsPathPrefixes {
  Accounts = `${AppBasePath.Settings}/${SettingsPath.Accounts}`,
  Experience = `${AppBasePath.Settings}/${SettingsPath.Experience}`,
  Profile = `${AppBasePath.Settings}/${SettingsPath.ProfilePage}`,
  Objects = `${AppBasePath.Settings}/${SettingsPath.Objects}`,
  Members = `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`,
  Developers = `${AppBasePath.Settings}/${SettingsPath.Developers}`,
  ServerlessFunctions = `${AppBasePath.Settings}/${SettingsPath.ServerlessFunctions}`,
  Integration = `${AppBasePath.Settings}/${SettingsPath.Integrations}`,
  General = `${AppBasePath.Settings}/${SettingsPath.Workspace}`,
}

const getPathnameOrPrefix = (pathname: string) => {
  for (const prefix of Object.values(SettingsPathPrefixes)) {
    if (pathname.startsWith(prefix)) {
      return prefix;
    }
  }
  return pathname;
};

export const getPageTitleFromPath = (pathname: string): string => {
  const pathnameOrPrefix = getPathnameOrPrefix(pathname);
  switch (pathnameOrPrefix) {
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
    case SettingsPathPrefixes.Experience:
      return SettingsPageTitles.Experience;
    case SettingsPathPrefixes.Accounts:
      return SettingsPageTitles.Accounts;
    case SettingsPathPrefixes.Profile:
      return SettingsPageTitles.Profile;
    case SettingsPathPrefixes.Members:
      return SettingsPageTitles.Members;
    case SettingsPathPrefixes.Objects:
      return SettingsPageTitles.Objects;
    case SettingsPathPrefixes.Developers:
      return SettingsPageTitles.Developers;
    case SettingsPathPrefixes.ServerlessFunctions:
      return SettingsPageTitles.ServerlessFunctions;
    case SettingsPathPrefixes.Integration:
      return SettingsPageTitles.Integration;
    case SettingsPathPrefixes.General:
      return SettingsPageTitles.General;
    default:
      return 'Twenty';
  }
};
