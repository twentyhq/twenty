import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { isPersonalConnectedAccount } from '@/settings/app-preferences/utils/isPersonalConnectedAccount';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useMyPersonalConnectedAccounts = ({
  providers,
}: {
  providers: ReadonlySet<ConnectedAccountProvider>;
}) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { accounts, loading, error, refetch } = useMyConnectedAccounts({
    providers,
  });

  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const personalAccounts = isDefined(userWorkspaceId)
    ? accounts.filter((account) =>
        isPersonalConnectedAccount({ account, userWorkspaceId }),
      )
    : [];

  return { accounts: personalAccounts, loading, error, refetch };
};
