import { useQuery } from '@apollo/client/react';

import { FIND_APPLICATION_OAUTH_PROVIDERS } from '@/settings/applications/graphql/queries/findApplicationOAuthProviders';
import { type FrontendApplicationOAuthProvider } from '~/pages/settings/applications/types/FrontendApplicationOAuthProvider';

type QueryResult = {
  applicationOAuthProviders: FrontendApplicationOAuthProvider[];
};

export const useFindApplicationOAuthProviders = (applicationId?: string) => {
  const { data, loading, refetch } = useQuery<QueryResult>(
    FIND_APPLICATION_OAUTH_PROVIDERS,
    {
      skip: !applicationId,
      variables: { applicationId: applicationId ?? '' },
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    oauthProviders: data?.applicationOAuthProviders ?? [],
    loading,
    refetch,
  };
};
