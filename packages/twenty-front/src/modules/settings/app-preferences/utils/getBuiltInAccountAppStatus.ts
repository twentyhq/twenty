import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { isDefined } from 'twenty-shared/utils';

export const getBuiltInAccountAppStatus = <
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
