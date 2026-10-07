import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isValidUuid } from 'twenty-shared/utils';

export const getAppPreferencesOAuthRedirectPath = ({
  applicationId,
  redirectLocation,
}: {
  applicationId: string;
  redirectLocation: string | null | undefined;
}): string | null => {
  if (
    redirectLocation === getSettingsPath(SettingsPath.AppPreferences) ||
    (isValidUuid(applicationId) &&
      redirectLocation ===
        getSettingsPath(SettingsPath.AppPreferencesApplication, {
          applicationId,
        }))
  ) {
    return redirectLocation;
  }

  return null;
};
