import { useStore } from 'jotai';
import {
  canConnectedAccountSendEmail,
  isDefined,
  resolveDefaultEmailSender,
} from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccountSender } from '@/accounts/types/ConnectedAccountSender';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useResolveNewEmailSender = () => {
  const store = useStore();
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);

  const resolveNewEmailSender = (): ConnectedAccountSender | null => {
    const connectedAccounts = store.get(myConnectedAccountsState.atom) ?? [];

    const defaultSender = resolveDefaultEmailSender({
      accounts: connectedAccounts,
      personalFromHandle: store.get(currentUserWorkspaceState.atom)
        ?.defaultFromHandle,
      workspaceSenderDomain: store.get(currentWorkspaceState.atom)
        ?.defaultSenderDomain,
    });

    if (isDefined(defaultSender)) {
      return defaultSender;
    }

    const firstSendableAccount = connectedAccounts.find(
      canConnectedAccountSendEmail,
    );

    return isDefined(firstSendableAccount)
      ? { connectedAccountId: firstSendableAccount.id }
      : null;
  };

  return {
    resolveNewEmailSender,
    loading: !isDefined(myConnectedAccounts),
  };
};
