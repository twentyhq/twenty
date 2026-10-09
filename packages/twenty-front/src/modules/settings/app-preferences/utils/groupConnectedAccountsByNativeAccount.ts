import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const normalizeHandle = (handle: string) => handle.trim().toLowerCase();

export const groupConnectedAccountsByNativeAccount = <
  TConnectedAccount extends Pick<
    ConnectedAccount,
    'id' | 'handle' | 'provider'
  >,
>(
  accounts: TConnectedAccount[],
): ConnectedAccountGroup<TConnectedAccount>[] => {
  const groups: ConnectedAccountGroup<TConnectedAccount>[] = accounts
    .filter((account) => account.provider !== ConnectedAccountProvider.APP)
    .map((nativeAccount) => ({
      id: nativeAccount.id,
      handle: nativeAccount.handle,
      nativeAccount,
      appAccounts: [],
    }));

  const appAccounts = accounts.filter(
    (account) => account.provider === ConnectedAccountProvider.APP,
  );

  for (const appAccount of appAccounts) {
    const group = groups.find(
      (candidate) =>
        normalizeHandle(candidate.handle) ===
        normalizeHandle(appAccount.handle),
    );

    if (isDefined(group)) {
      group.appAccounts.push(appAccount);
    } else {
      groups.push({
        id: appAccount.id,
        handle: appAccount.handle,
        appAccounts: [appAccount],
      });
    }
  }

  return groups;
};
