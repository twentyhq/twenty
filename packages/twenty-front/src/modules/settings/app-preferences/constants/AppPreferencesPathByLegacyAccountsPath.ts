import { SettingsPath } from 'twenty-shared/types';

// TODO(@ehconitin): drop AccountDetail, BuiltInAccountApp and ApplicationPreferences after 2027-01-14, the rest with IS_APP_PREFERENCES_ENABLED.
export const APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH = {
  [SettingsPath.Accounts]: SettingsPath.AppPreferences,
  [SettingsPath.AccountsEmails]: SettingsPath.AppPreferences,
  [SettingsPath.AccountsCalendars]: SettingsPath.AppPreferences,
  [SettingsPath.AccountDetail]: SettingsPath.AppPreferencesAccountDetail,
  [SettingsPath.BuiltInAccountApp]: SettingsPath.AppPreferencesApp,
  [SettingsPath.ApplicationPreferences]: SettingsPath.AppPreferencesApp,
  [SettingsPath.NewAccount]: SettingsPath.AppPreferencesNewAccount,
  [SettingsPath.AccountsConfiguration]:
    SettingsPath.AppPreferencesAccountConfiguration,
  [SettingsPath.NewImapSmtpCaldavConnection]:
    SettingsPath.AppPreferencesNewImapSmtpCaldavConnection,
  [SettingsPath.EditImapSmtpCaldavConnection]:
    SettingsPath.AppPreferencesEditImapSmtpCaldavConnection,
} as const;
