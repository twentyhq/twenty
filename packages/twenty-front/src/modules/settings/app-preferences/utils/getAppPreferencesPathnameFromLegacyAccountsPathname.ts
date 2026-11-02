import { APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH } from '@/settings/app-preferences/constants/AppPreferencesPathByLegacyAccountsPath';
import { generatePath, matchPath } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  typedObjectEntries,
} from 'twenty-shared/utils';

export const getAppPreferencesPathnameFromLegacyAccountsPathname = (
  legacyAccountsPathname: string,
) => {
  for (const [legacyAccountsPath, appPreferencesPath] of typedObjectEntries(
    APP_PREFERENCES_PATH_BY_LEGACY_ACCOUNTS_PATH,
  )) {
    const legacyAccountsPathMatch = matchPath(
      getSettingsPath(legacyAccountsPath),
      legacyAccountsPathname,
    );

    if (isDefined(legacyAccountsPathMatch)) {
      return generatePath(
        getSettingsPath(appPreferencesPath),
        legacyAccountsPathMatch.params,
      );
    }
  }

  return getSettingsPath(SettingsPath.AppPreferences);
};
