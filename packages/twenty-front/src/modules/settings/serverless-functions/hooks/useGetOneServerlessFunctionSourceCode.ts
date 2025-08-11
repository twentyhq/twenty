import { useQuery } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import {
  type FindOneServerlessFunctionSourceCodeQuery,
  type FindOneServerlessFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetOneServerlessFunctionSourceCode = ({
  id,
  version,
  onCompleted,
}: {
  id: string;
  version: string;
  onCompleted?: (data: FindOneServerlessFunctionSourceCodeQuery) => void;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    FindOneServerlessFunctionSourceCodeQuery,
    FindOneServerlessFunctionSourceCodeQueryVariables
  >(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id, version },
    },
    onCompleted,
    fetchPolicy: 'network-only',
  });
  return { code: data?.getServerlessFunctionSourceCode, loading };
};
