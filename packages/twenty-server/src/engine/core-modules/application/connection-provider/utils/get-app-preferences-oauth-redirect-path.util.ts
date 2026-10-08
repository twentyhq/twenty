import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined, isValidUuid } from 'twenty-shared/utils';

export const getAppPreferencesOAuthRedirectPath = ({
  applicationId,
  redirectLocation,
  reconnectingConnectedAccountId,
}: {
  applicationId: string;
  redirectLocation: string | null | undefined;
  reconnectingConnectedAccountId?: string | null;
}): string | null => {
  if (
    redirectLocation === getSettingsPath(SettingsPath.AppPreferences) ||
    (isValidUuid(applicationId) &&
      redirectLocation ===
        getSettingsPath(SettingsPath.AppPreferencesApplication, {
          applicationId,
        })) ||
    (isValidUuid(applicationId) &&
      isDefined(reconnectingConnectedAccountId) &&
      isValidUuid(reconnectingConnectedAccountId) &&
      redirectLocation ===
        getSettingsPath(SettingsPath.AppPreferencesAccount, {
          connectedAccountId: reconnectingConnectedAccountId,
        }))
  ) {
    return redirectLocation;
  }

  return null;
};
