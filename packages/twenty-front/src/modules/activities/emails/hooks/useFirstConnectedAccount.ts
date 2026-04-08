import { useQuery } from '@apollo/client/react';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

export const useFirstConnectedAccount = () => {
  const { data, loading } = useQuery<{
    myConnectedAccounts: { id: string; handle: string }[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const firstAccount = data?.myConnectedAccounts?.[0] ?? null;

  return {
    connectedAccountId: firstAccount?.id ?? null,
    connectedAccountHandle: firstAccount?.handle ?? null,
    loading,
  };
};
