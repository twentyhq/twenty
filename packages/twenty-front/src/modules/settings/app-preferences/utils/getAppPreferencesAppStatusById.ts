import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type AppPreferencesAppStatusApplication = {
  application: Pick<ApplicationWithPreferences['application'], 'id'>;
  connectionProviders: Parameters<
    typeof canStartConnectionProviderAuthorization
  >[0][];
  missingRequiredVariables: Pick<
    ApplicationWithPreferences['missingRequiredVariables'][number],
    'key'
  >[];
};

type AppPreferencesAppStatusAccount = Pick<
  ConnectedAccount,
  'provider' | 'archivedAt' | 'authFailedAt' | 'applicationId'
> & {
  messageChannels: Pick<MessageChannel, 'type' | 'syncStatus' | 'syncStage'>[];
  calendarChannels: Pick<CalendarChannel, 'syncStatus' | 'syncStage'>[];
};

const getBuiltInAccountAppStatus = <
  TConnectedAccount extends AppPreferencesAppStatusAccount,
>({
  builtInAccountAppId,
  activeBuiltInAccounts,
}: {
  builtInAccountAppId: BuiltInAccountApp['id'];
  activeBuiltInAccounts: TConnectedAccount[];
}): AppPreferencesAppStatus<TConnectedAccount> | undefined => {
  const accountsUsingApp = activeBuiltInAccounts.filter((account) =>
    getBuiltInAccountAppsUsingAccount(account).some(
      (app) => app.id === builtInAccountAppId,
    ),
  );
  const findAccountWithStatus = (status: SyncStatus) =>
    accountsUsingApp.find(
      (account) =>
        computeSyncStatus(
          account.messageChannels[0],
          account.calendarChannels[0],
        ) === status,
    );
  const brokenAccount =
    findAccountWithStatus(SyncStatus.FAILED) ??
    findAccountWithStatus(SyncStatus.PENDING_CONFIGURATION);

  return isDefined(brokenAccount)
    ? { type: 'accountSyncIssue', account: brokenAccount }
    : undefined;
};

const getInstalledApplicationStatus = ({
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

export const getAppPreferencesAppStatusById = <
  TConnectedAccount extends AppPreferencesAppStatusAccount,
>({
  groups,
  builtInAccountApps,
  applicationsWithPreferences,
}: {
  groups: ConnectedAccountGroup<TConnectedAccount>[];
  builtInAccountApps: Pick<BuiltInAccountApp, 'id'>[];
  applicationsWithPreferences: AppPreferencesAppStatusApplication[];
}): Record<string, AppPreferencesAppStatus<TConnectedAccount>> => {
  const activeBuiltInAccounts = groups
    .map((group) => group.builtInAccount)
    .filter(isDefined)
    .filter((account) => !isDefined(account.archivedAt));
  const activeAppAccounts = groups
    .flatMap((group) => group.appAccounts)
    .filter((account) => !isDefined(account.archivedAt));

  const statusById: Record<
    string,
    AppPreferencesAppStatus<TConnectedAccount>
  > = {};

  for (const { id } of builtInAccountApps) {
    const status = getBuiltInAccountAppStatus({
      builtInAccountAppId: id,
      activeBuiltInAccounts,
    });

    if (isDefined(status)) {
      statusById[id] = status;
    }
  }

  for (const applicationWithPreferences of applicationsWithPreferences) {
    const status = getInstalledApplicationStatus({
      applicationWithPreferences,
      activeAppAccounts,
    });

    if (isDefined(status)) {
      statusById[applicationWithPreferences.application.id] = status;
    }
  }

  return statusById;
};
