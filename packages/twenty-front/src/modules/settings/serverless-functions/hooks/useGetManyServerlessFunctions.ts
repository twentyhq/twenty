import { useQuery } from '@apollo/client';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  GetManyServerlessFunctionsQuery,
  GetManyServerlessFunctionsQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetManyServerlessFunctions = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { data } = useQuery<
    GetManyServerlessFunctionsQuery,
    GetManyServerlessFunctionsQueryVariables
  >(FIND_MANY_SERVERLESS_FUNCTIONS, {
    client: apolloMetadataClient ?? undefined,
  });
  return {
    serverlessFunctions:
      data?.serverlessFunctions?.edges.map(({ node }) => node) || [],
  };
};
