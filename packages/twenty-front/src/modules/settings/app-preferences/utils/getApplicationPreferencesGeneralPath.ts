import { APPLICATION_PREFERENCES_GENERAL_TAB_ID } from '@/settings/app-preferences/constants/ApplicationPreferencesGeneralTabId';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const getApplicationPreferencesGeneralPath = (applicationId: string) =>
  getSettingsPath(
    SettingsPath.ApplicationPreferences,
    { applicationId },
    undefined,
    APPLICATION_PREFERENCES_GENERAL_TAB_ID,
  );
