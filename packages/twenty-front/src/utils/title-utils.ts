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
      return 'Profile - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Appearance}`:
      return 'Appearance - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Accounts}`:
      return 'Accounts - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Accounts}/new`:
      return 'New Account - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.AccountsEmails}`:
      return 'Emails - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.AccountsEmailsInboxSettings}`:
      return 'Emails Settings - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.AccountsCalendars}`:
      return 'Calendars - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.AccountsCalendarsSettings}`:
      return 'Calendars Settings - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Billing}`:
      return 'Billing - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Objects}`:
      return 'Objects - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.NewObject}`:
      return 'New Object - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Developers}`:
      return 'Developers - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Developers}/${SettingsPath.DevelopersNewApiKey}`:
      return 'New API Key - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Integrations}`:
      return 'Integrations - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Developers}/${SettingsPath.DevelopersNewWebhook}`:
      return 'New webhook - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.WorkspaceMembersPage}`:
      return 'Workspace Members - Settings';
    case `${AppBasePath.Settings}/${SettingsPath.Workspace}`:
      return 'Workspace - Settings';
    default:
      return 'Twenty';
  }
};
