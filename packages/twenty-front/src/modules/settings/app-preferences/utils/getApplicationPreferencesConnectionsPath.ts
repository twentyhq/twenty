import { APPLICATION_PREFERENCES_CONNECTIONS_TAB_ID } from '@/settings/app-preferences/constants/ApplicationPreferencesConnectionsTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getApplicationPreferencesConnectionsPath = (
  applicationId: string,
) =>
  getSettingsPath(
    SettingsPath.ApplicationPreferences,
    { applicationId },
    undefined,
    APPLICATION_PREFERENCES_CONNECTIONS_TAB_ID,
  );
