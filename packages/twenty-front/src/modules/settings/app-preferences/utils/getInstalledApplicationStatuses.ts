import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type AppPreferencesAppStatusApplication } from '@/settings/app-preferences/types/AppPreferencesAppStatusApplication';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { isNonEmptyArray } from 'twenty-shared/utils';

type InstalledApplicationStatus = Exclude<
  SettingsMemberApplicationStatus,
  { type: 'accountSyncIssue' }
>;

export const getInstalledApplicationStatuses = ({
  applicationWithPreferences: {
    application,
    connectionProviders,
    missingRequiredVariables,
  },
  activeAppAccounts,
}: {
  applicationWithPreferences: AppPreferencesAppStatusApplication;
  activeAppAccounts: AppPreferencesAppStatusAccount[];
}): InstalledApplicationStatus[] => {
  const statuses: InstalledApplicationStatus[] = [];

  const activeConnections = activeAppAccounts.filter(
    (account) => account.applicationId === application.id,
  );

  if (activeConnections.some(isApplicationConnectionReconnectNeeded)) {
    statuses.push({ type: 'reconnectNeeded' });
  }

  const isAppInUse =
    !isNonEmptyArray(connectionProviders) || isNonEmptyArray(activeConnections);

  if (isAppInUse && isNonEmptyArray(missingRequiredVariables)) {
    statuses.push({ type: 'missingConfiguration' });
  }

  if (
    !isNonEmptyArray(activeConnections) &&
    connectionProviders.some(canStartConnectionProviderAuthorization)
  ) {
    statuses.push({ type: 'notConnected' });
  }

  return statuses;
};
