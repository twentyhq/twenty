import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { groupConnectedAccountsByNativeAccount } from '@/settings/consolidated-accounts/utils/groupConnectedAccountsByNativeAccount';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const ACCOUNT_GROUP_PROVIDERS: ReadonlySet<ConnectedAccountProvider> = new Set([
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  ConnectedAccountProvider.APP,
]);

export const useMyAccountGroups = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { accounts, loading } = useMyConnectedAccounts({
    providers: ACCOUNT_GROUP_PROVIDERS,
  });

  return {
    groups: groupConnectedAccountsByNativeAccount(
      accounts.filter(
        (account) =>
          account.userWorkspaceId === currentWorkspaceMember?.userWorkspaceId,
      ),
    ),
    loading,
  };
};
