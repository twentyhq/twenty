import { t } from '@lingui/core/macro';
import { AppBasePath, AppPath, SettingsPath } from 'twenty-shared/types';

enum SettingsPathPrefixes {
  Accounts = `${AppBasePath.Settings}/${SettingsPath.Accounts}`,
  Billing = `${AppBasePath.Settings}/${SettingsPath.Billing}`,
  Experience = `${AppBasePath.Settings}/${SettingsPath.Experience}`,
  Profile = `${AppBasePath.Settings}/${SettingsPath.ProfilePage}`,
  Objects = `${AppBasePath.Settings}/${SettingsPath.Objects}`,
  Members = `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`,
  ApiWebhooks = `${AppBasePath.Settings}/${SettingsPath.ApiWebhooks}`,
  LogicFunctions = `${AppBasePath.Settings}/${SettingsPath.LogicFunctions}`,
  Integration = `${AppBasePath.Settings}/${SettingsPath.Integrations}`,
  General = `${AppBasePath.Settings}/${SettingsPath.General}`,
  Community = `${AppBasePath.Settings}/${SettingsPath.Community}`,
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
      return t`Verify`;
    case AppPath.SignInUp:
      return t`Sign in or Create an account`;
    case AppPath.Invite:
      return t`Invite`;
    case AppPath.WorkspaceActivation:
      return t`Create Workspace`;
    case AppPath.CreateProfile:
      return t`Create Profile`;
    case SettingsPathPrefixes.Experience:
      return t`Experience - Settings`;
    case SettingsPathPrefixes.Accounts:
      return t`Account - Settings`;
    case SettingsPathPrefixes.Billing:
      return t`Billing - Settings`;
    case SettingsPathPrefixes.Profile:
      return t`Profile - Settings`;
    case SettingsPathPrefixes.Members:
      return t`Members - Settings`;
    case SettingsPathPrefixes.Objects:
      return t`Data model - Settings`;
    case SettingsPathPrefixes.ApiWebhooks:
      return t`MCP & APIs - Settings`;
    case SettingsPathPrefixes.LogicFunctions:
      return t`Functions - Settings`;
    case SettingsPathPrefixes.Integration:
      return t`Integrations - Settings`;
    case SettingsPathPrefixes.General:
      return t`General - Settings`;
    case SettingsPathPrefixes.Community:
      return t`Community - Settings`;
    default:
      return 'Twenty';
  }
};
