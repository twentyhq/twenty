import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { useQuery } from '@apollo/client';
import {
  type GetManyServerlessFunctionsQuery,
  type GetManyServerlessFunctionsQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetManyServerlessFunctions = () => {
  const apolloMetadataClient = useApolloCoreClient();

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
