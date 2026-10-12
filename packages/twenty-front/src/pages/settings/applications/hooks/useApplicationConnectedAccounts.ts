import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import {
  ApplicationConnectedAccountsDocument,
  type ApplicationConnectedAccountsQuery,
} from '~/generated-metadata/graphql';

export type ApplicationConnectedAccount =
  ApplicationConnectedAccountsQuery['applicationConnectedAccounts'][number];

export const useApplicationConnectedAccounts = (applicationId: string) => {
  const { data, loading, refetch } = useQuery(
    ApplicationConnectedAccountsDocument,
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
