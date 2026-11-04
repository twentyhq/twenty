import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { DISCONNECT_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/disconnectConnectedAccount';
import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { type AccountGroupActionTarget } from '@/settings/app-preferences/types/AccountGroupActionTarget';
import { getAccountGroupActionFailureMessage } from '@/settings/app-preferences/utils/getAccountGroupActionFailureMessage';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

export const useRunAccountGroupAction = () => {
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [deleteConnectedAccount] = useMutation(DELETE_CONNECTED_ACCOUNT);
  const [disconnectConnectedAccount] = useMutation(
    DISCONNECT_CONNECTED_ACCOUNT,
  );

  const runAccountGroupAction = async ({
    action,
    targets,
  }: {
    action: AccountGroupAction;
    targets: AccountGroupActionTarget[];
  }) => {
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
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { runAccountGroupAction };
};
