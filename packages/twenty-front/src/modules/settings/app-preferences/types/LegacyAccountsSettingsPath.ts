import { type APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH } from '@/settings/app-preferences/constants/AppPreferencesPathByLegacyAccountsPath';

export type LegacyAccountsSettingsPath =
  keyof typeof APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH;
