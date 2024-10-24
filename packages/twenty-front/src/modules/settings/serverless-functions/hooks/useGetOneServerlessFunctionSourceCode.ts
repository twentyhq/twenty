import { useQuery } from '@apollo/client';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import {
  FindOneServerlessFunctionSourceCodeQuery,
  FindOneServerlessFunctionSourceCodeQueryVariables,
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
  const apolloMetadataClient = useApolloMetadataClient();
  const { data, loading } = useQuery<
    FindOneServerlessFunctionSourceCodeQuery,
    FindOneServerlessFunctionSourceCodeQueryVariables
  >(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id, version },
    },
    onCompleted,
  });
  return { code: data?.getServerlessFunctionSourceCode, loading };
};
