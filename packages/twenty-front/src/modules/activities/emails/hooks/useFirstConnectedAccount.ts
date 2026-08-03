import { useQuery } from '@apollo/client/react';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

type UseFirstConnectedAccountOptions = {
  skip?: boolean;
  preferredHandle?: string;
};

export const useFirstConnectedAccount = (
  options?: UseFirstConnectedAccountOptions,
) => {
  const { data, loading } = useQuery<{
    myConnectedAccounts: { id: string; handle: string }[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    skip: options?.skip,
  });

  const connectedAccount = options?.preferredHandle
    ? (data?.myConnectedAccounts.find(
        ({ handle }) =>
          handle.toLowerCase() === options.preferredHandle?.toLowerCase(),
      ) ?? null)
    : (data?.myConnectedAccounts?.[0] ?? null);

  return {
    connectedAccountId: connectedAccount?.id ?? null,
    connectedAccountHandle: connectedAccount?.handle ?? null,
    loading,
  };
};
