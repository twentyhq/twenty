import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationConnectedAccountsDocument,
  type ApplicationConnectedAccountsQuery,
} from '~/generated-metadata/graphql';
import { APP_CONNECTION_ON_CONNECT_REFETCH } from '~/pages/settings/applications/constants/AppConnectionOnConnectRefetch';

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

  const accounts = data?.applicationConnectedAccounts ?? [];

  const hasRecentCredentialsChange = accounts.some(
    ({ lastCredentialsRefreshedAt }) =>
      isDefined(lastCredentialsRefreshedAt) &&
      Date.now() - new Date(lastCredentialsRefreshedAt).getTime() <
        APP_CONNECTION_ON_CONNECT_REFETCH.recentCredentialsChangeWindowInMs,
  );

  // Picks up a merge or a split done by the app's onConnect after the OAuth
  // callback redirected here.
  useEffect(() => {
    if (!hasRecentCredentialsChange) {
      return;
    }

    const timeout = setTimeout(() => {
      void refetch();
    }, APP_CONNECTION_ON_CONNECT_REFETCH.refetchDelayInMs);

    return () => clearTimeout(timeout);
  }, [hasRecentCredentialsChange, refetch]);

  return {
    accounts,
    loading,
    refetch,
  };
};
