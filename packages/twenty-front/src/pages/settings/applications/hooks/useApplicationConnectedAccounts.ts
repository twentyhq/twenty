import { useQuery } from '@apollo/client/react';

import { FIND_APPLICATION_CONNECTED_ACCOUNTS } from '@/settings/applications/graphql/queries/findApplicationConnectedAccounts';
import { type ApplicationConnectedAccountsQuery } from '~/generated-metadata/graphql';

export type ApplicationConnectedAccount =
  ApplicationConnectedAccountsQuery['applicationConnectedAccounts'][number];

// Returns the app connections the current user can use: workspace-shared ones
// from any member plus the user's own personal ones.
export const useApplicationConnectedAccounts = (applicationId: string) => {
  const { data, loading, refetch } =
    useQuery<ApplicationConnectedAccountsQuery>(
      FIND_APPLICATION_CONNECTED_ACCOUNTS,
      {
        variables: { applicationId },
        skip: applicationId === '',
        fetchPolicy: 'cache-and-network',
      },
    );

  return {
    accounts: data?.applicationConnectedAccounts ?? [],
    loading,
    refetch,
  };
};
