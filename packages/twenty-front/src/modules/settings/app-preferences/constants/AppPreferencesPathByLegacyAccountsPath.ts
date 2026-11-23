import { SettingsPath } from 'twenty-shared/types';

// TODO(@ehconitin): remove these legacy redirects after 2027-02-16, once the published apps and companion stop linking here.
export const APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH = {
  accounts: SettingsPath.AppPreferences,
  'accounts/emails': SettingsPath.AppPreferences,
  'accounts/calendars': SettingsPath.AppPreferences,
  'accounts/detail/:connectedAccountId':
    SettingsPath.AppPreferencesAccountDetail,
  'accounts/apps/:applicationId': SettingsPath.AppPreferencesApp,
  'accounts/applications/:applicationId': SettingsPath.AppPreferencesApp,
  'accounts/new': SettingsPath.AppPreferencesNewAccount,
  'accounts/configuration/:connectedAccountId':
    SettingsPath.AppPreferencesAccountConfiguration,
  'accounts/new-imap-smtp-caldav-connection':
    SettingsPath.AppPreferencesNewImapSmtpCaldavConnection,
  'accounts/edit-imap-smtp-caldav-connection/:connectedAccountId':
    SettingsPath.AppPreferencesEditImapSmtpCaldavConnection,
} as const;
