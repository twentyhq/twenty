import { resolveDefaultEmailSender } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseDefaultEmailSenderArgs = {
  restrictToConnectedAccountId: string;
};

export const useDefaultEmailSender = ({
  restrictToConnectedAccountId,
}: UseDefaultEmailSenderArgs) => {
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);

  return resolveDefaultEmailSender({
    accounts: myConnectedAccounts ?? [],
    personalFromHandle: currentUserWorkspace?.defaultFromHandle,
    workspaceSenderDomain: currentWorkspace?.defaultSenderDomain,
    restrictToConnectedAccountId,
  });
};
