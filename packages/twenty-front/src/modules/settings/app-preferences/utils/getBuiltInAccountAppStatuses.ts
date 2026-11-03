import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const getBuiltInAccountAppStatuses = <
  TConnectedAccount extends AppPreferencesAppStatusAccount,
>({
  builtInAccountAppId,
  builtInAccounts,
}: {
  builtInAccountAppId: BuiltInAccountApp['id'];
  builtInAccounts: TConnectedAccount[];
}): SettingsMemberApplicationStatus<TConnectedAccount>[] => {
  const accountsUsingApp = builtInAccounts.filter((account) =>
    getBuiltInAccountAppsUsingAccount(account).some(
      (app) => app.id === builtInAccountAppId,
    ),
  );

  if (!isNonEmptyArray(accountsUsingApp)) {
    return [{ type: 'notConnected' }];
  }

  const findActiveAccountWithStatus = (status: SyncStatus) =>
    accountsUsingApp.find(
      (account) =>
        !isDefined(account.archivedAt) &&
        computeSyncStatus(
          account.messageChannels[0],
          account.calendarChannels[0],
        ) === status,
    );
  const brokenAccount =
    findActiveAccountWithStatus(SyncStatus.FAILED) ??
    findActiveAccountWithStatus(SyncStatus.PENDING_CONFIGURATION);

  return isDefined(brokenAccount)
    ? [{ type: 'accountSyncIssue', account: brokenAccount }]
    : [];
};
