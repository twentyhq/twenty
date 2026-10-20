import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { groupConnectedAccountsByBuiltInAccount } from '@/settings/app-preferences/utils/groupConnectedAccountsByBuiltInAccount';
import { isPersonalConnectedAccount } from '@/settings/app-preferences/utils/isPersonalConnectedAccount';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const personalAccounts = isDefined(userWorkspaceId)
    ? accounts.filter((account) =>
        isPersonalConnectedAccount({ account, userWorkspaceId }),
      )
    : [];

  return {
    groups: groupConnectedAccountsByBuiltInAccount(personalAccounts),
    loading,
  };
};
