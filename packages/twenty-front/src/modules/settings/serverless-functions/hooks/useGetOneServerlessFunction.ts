import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunction';
import { useQuery } from '@apollo/client';
import {
  type GetOneServerlessFunctionQuery,
  type GetOneServerlessFunctionQueryVariables,
  type ServerlessFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetOneServerlessFunction = ({
  id,
  onCompleted,
}: ServerlessFunctionIdInput & {
  onCompleted?: (data: GetOneServerlessFunctionQuery) => void;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    GetOneServerlessFunctionQuery,
    GetOneServerlessFunctionQueryVariables
  >(FIND_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id },
    },
    onCompleted,
  });
  return {
    serverlessFunction: data?.findOneServerlessFunction || null,
    loading,
  };
};
