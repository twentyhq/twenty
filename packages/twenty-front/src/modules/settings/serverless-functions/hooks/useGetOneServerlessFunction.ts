import { useQuery } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunction';
import {
  ServerlessFunctionIdInput,
  GetOneServerlessFunctionQuery,
  GetOneServerlessFunctionQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetOneServerlessFunction = (
  input: ServerlessFunctionIdInput,
) => {
  const apolloMetadataClient = useApolloCoreClient();
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
