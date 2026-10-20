import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { groupConnectedAccountsByBuiltInAccount } from '@/settings/app-preferences/utils/groupConnectedAccountsByBuiltInAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const ACCOUNT_GROUP_PROVIDERS: ReadonlySet<ConnectedAccountProvider> = new Set([
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ConnectedAccountProvider.APP,
]);

export const useMyAccountGroups = () => {
  const { accounts, loading } = useMyPersonalConnectedAccounts({
    providers: ACCOUNT_GROUP_PROVIDERS,
  });

  return {
    groups: groupConnectedAccountsByBuiltInAccount(accounts),
    loading,
  };
};
