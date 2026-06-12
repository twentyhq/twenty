import { useQuery } from '@apollo/client/react';

import { FIND_APPLICATION_CONNECTION_PROVIDERS } from '@/settings/applications/graphql/queries/findApplicationConnectionProviders';
import { type FrontendApplicationConnectionProvider } from '~/pages/settings/applications/types/FrontendApplicationConnectionProvider';

type QueryResult = {
  applicationConnectionProviders: FrontendApplicationConnectionProvider[];
};

export const useFindApplicationConnectionProviders = (
  applicationId?: string,
) => {
  const { data, loading, refetch } = useQuery<QueryResult>(
    FIND_APPLICATION_CONNECTION_PROVIDERS,
    {
      skip: !applicationId,
      variables: { applicationId: applicationId ?? '' },
      // Provider list only changes on app install/update; cache is fine.
      fetchPolicy: 'cache-first',
    },
  );

  return {
    connectionProviders: data?.applicationConnectionProviders ?? [],
    loading,
    refetch,
  };
};
