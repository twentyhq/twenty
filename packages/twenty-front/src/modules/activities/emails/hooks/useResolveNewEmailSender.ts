import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, resolveDefaultEmailSender } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { findFirstConnectedAccountAbleToSendEmail } from '@/accounts/utils/findFirstConnectedAccountAbleToSendEmail';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

type NewEmailSender = {
  connectedAccountId: string;
  fromHandle?: string;
};

export const useResolveNewEmailSender = () => {
  const store = useStore();

  const resolveNewEmailSender = useCallback((): NewEmailSender | null => {
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

    const firstAccount =
      findFirstConnectedAccountAbleToSendEmail(connectedAccounts);

    return isDefined(firstAccount)
      ? { connectedAccountId: firstAccount.id }
      : null;
  }, [store]);

  return { resolveNewEmailSender };
};
