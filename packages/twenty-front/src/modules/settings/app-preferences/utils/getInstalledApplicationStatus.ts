import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type AppPreferencesAppStatusApplication } from '@/settings/app-preferences/types/AppPreferencesAppStatusApplication';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getInstalledApplicationStatus = ({
  applicationWithPreferences: {
    application,
    connectionProviders,
    missingRequiredVariables,
  },
  activeAppAccounts,
}: {
  applicationWithPreferences: AppPreferencesAppStatusApplication;
  activeAppAccounts: AppPreferencesAppStatusAccount[];
}):
  | Exclude<AppPreferencesAppStatus, { type: 'accountSyncIssue' }>
  | undefined => {
  const activeConnections = activeAppAccounts.filter(
    (account) => account.applicationId === application.id,
  );

  if (activeConnections.some(isApplicationConnectionReconnectNeeded)) {
    return { type: 'reconnectNeeded' };
  }

  const isAppInUse =
    !isNonEmptyArray(connectionProviders) || isNonEmptyArray(activeConnections);

  if (isAppInUse && isNonEmptyArray(missingRequiredVariables)) {
    return { type: 'missingConfiguration' };
  }

  if (
    isNonEmptyArray(activeConnections) ||
    !connectionProviders.some(canStartConnectionProviderAuthorization)
  ) {
    return undefined;
  }

  return { type: 'notConnected' };
};
