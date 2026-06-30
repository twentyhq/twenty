import { useApolloClient, useQuery } from '@apollo/client/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import {
  MyConnectedAccountsDocument,
  type MyConnectedAccountsQuery,
} from '~/generated-metadata/graphql';

// App OAuth connections only — i.e. ConnectedAccount rows with
// `provider = 'app'`. The email/calendar `useMyConnectedAccounts` filters
// these out; this hook is the inverse, used by the per-app settings tab.
//
// We keep the legacy `gql\`...\`` document around in
// `getMyConnectedAccounts.ts` because other consumers (and the mutation
// `refetchQueries` list) still reference it by identity. Internally,
// though, we type the query result against the codegen-generated shape so
// new fields surface here automatically.
export type AppConnectedAccount =
  MyConnectedAccountsQuery['myConnectedAccounts'][number];

export const useMyAppConnectedAccounts = () => {
  const apolloClient = useApolloClient();

  const { data, loading, refetch } = useQuery(GET_MY_CONNECTED_ACCOUNTS, {
    client: apolloClient,
    fetchPolicy: 'cache-and-network',
  });

  // Cast to the codegen-typed query shape: the inline `gql` document above
  // is structurally identical to `MyConnectedAccountsDocument`, but Apollo
  // can't unify the two without help.
  const accounts = (
    (data as MyConnectedAccountsQuery | undefined)?.myConnectedAccounts ?? []
  ).filter(
    (account): account is AppConnectedAccount =>
      account.provider === ConnectedAccountProvider.APP,
  );

  return { accounts, loading, refetch };
};

// Re-export the generated document so callers that need to track a single
// source of truth can use it directly without looking up the path.
export { MyConnectedAccountsDocument };
