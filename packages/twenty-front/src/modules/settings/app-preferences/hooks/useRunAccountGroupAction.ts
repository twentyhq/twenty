import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { DISCONNECT_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/disconnectConnectedAccount';
import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { getAccountGroupActionFailureMessage } from '@/settings/app-preferences/utils/getAccountGroupActionFailureMessage';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

export const useRunAccountGroupAction = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [deleteConnectedAccount] = useMutation(DELETE_CONNECTED_ACCOUNT);
  const [disconnectConnectedAccount] = useMutation(
    DISCONNECT_CONNECTED_ACCOUNT,
  );
  const [isActionPending, setIsActionPending] = useState(false);

  const runAccountGroupAction = async ({
    action,
    targets,
  }: Pick<AccountGroupAction, 'action' | 'targets'>) => {
    if (isActionPending) {
      return;
    }

    setIsActionPending(true);

    try {
      const mutation =
        action === 'disconnect'
          ? disconnectConnectedAccount
          : deleteConnectedAccount;
      const results = await Promise.allSettled(
        targets.map(({ id }) => mutation({ variables: { id } })),
      );
      const failureMessage = getAccountGroupActionFailureMessage({
        action,
        targets,
        results,
      });

      if (isDefined(failureMessage)) {
        enqueueToast({ status: 'error', children: failureMessage });
      }

      try {
        await apolloClient.refetchQueries({ include: 'active' });
      } catch {
        enqueueToast({
          status: 'error',
          children: t`The account list could not be refreshed. Reload the page to check the current state.`,
        });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  return { isActionPending, runAccountGroupAction };
};
