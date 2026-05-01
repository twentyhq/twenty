import { useApolloClient, useQuery } from '@apollo/client/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

// App OAuth connections only — i.e. ConnectedAccount rows with
// `provider = 'app'`. The email/calendar `useMyConnectedAccounts` filters
// these out; this hook is the inverse, used by the per-app settings tab.
type AppConnectedAccount = {
  id: string;
  handle: string;
  provider: ConnectedAccountProvider;
  authFailedAt: string | null;
  scopes: string[] | null;
  applicationOAuthProviderId: string | null;
  lastCredentialsRefreshedAt: string | null;
};

export const useMyAppConnectedAccounts = () => {
  const apolloClient = useApolloClient();

  const { data, loading, refetch } = useQuery<{
    myConnectedAccounts: AppConnectedAccount[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    client: apolloClient,
    fetchPolicy: 'cache-and-network',
  });

  const accounts = (data?.myConnectedAccounts ?? []).filter(
    (account) => account.provider === ConnectedAccountProvider.APP,
  );

  return { accounts, loading, refetch };
};
