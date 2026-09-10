import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { FIND_APPLICATION_CONNECTED_ACCOUNTS } from '@/settings/applications/graphql/queries/findApplicationConnectedAccounts';
import { type ApplicationConnectedAccountsQuery } from '~/generated-metadata/graphql';

export type ApplicationConnectedAccount =
  ApplicationConnectedAccountsQuery['applicationConnectedAccounts'][number];

export const useApplicationConnectedAccounts = (applicationId: string) => {
  const { data, loading, refetch } =
    useQuery<ApplicationConnectedAccountsQuery>(
      FIND_APPLICATION_CONNECTED_ACCOUNTS,
      {
        variables: { applicationId },
        skip: !isNonEmptyString(applicationId),
        fetchPolicy: 'cache-and-network',
      },
    );

  return {
    accounts: data?.applicationConnectedAccounts ?? [],
    loading,
    refetch,
  };
};
