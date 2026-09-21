import { ConnectedAccountOperation } from 'twenty-shared/types';
import { useQuery } from '@apollo/client/react';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { canConnectedAccountPerformOperation } from 'twenty-shared/utils';

type UseFirstConnectedAccountOptions = {
  skip?: boolean;
};

export const useFirstConnectedAccount = (
  options?: UseFirstConnectedAccountOptions,
) => {
  const { data, loading } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    skip: options?.skip,
  });

  const firstAccount =
    data?.myConnectedAccounts?.find((connectedAccount) =>
      canConnectedAccountPerformOperation({
        connectedAccount,
        operation: ConnectedAccountOperation.SEND_EMAIL,
      }),
    ) ?? null;

  return {
    connectedAccountId: firstAccount?.id ?? null,
    connectedAccountHandle: firstAccount?.handle ?? null,
    loading,
  };
};
