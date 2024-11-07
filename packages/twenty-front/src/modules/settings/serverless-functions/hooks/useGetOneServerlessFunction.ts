import { useQuery } from '@apollo/client';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { FIND_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunction';
import {
  ServerlessFunctionIdInput,
  GetOneServerlessFunctionQuery,
  GetOneServerlessFunctionQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetOneServerlessFunction = (
  input: ServerlessFunctionIdInput,
) => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { data } = useQuery<
    GetOneServerlessFunctionQuery,
    GetOneServerlessFunctionQueryVariables
  >(FIND_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input,
    },
  });
  return {
    serverlessFunction: data?.findOneServerlessFunction || null,
  };
};
