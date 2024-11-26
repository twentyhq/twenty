import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { useQuery } from '@apollo/client';
import {
  GetManyServerlessFunctionsQuery,
  GetManyServerlessFunctionsQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetManyServerlessFunctions = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const { data, loading, error } = useQuery<
    GetManyServerlessFunctionsQuery,
    GetManyServerlessFunctionsQueryVariables
  >(FIND_MANY_SERVERLESS_FUNCTIONS, {
    client: apolloMetadataClient ?? undefined,
  });

  return {
    serverlessFunctions: data?.findManyServerlessFunctions || [],
    loading,
    error,
  };
};
