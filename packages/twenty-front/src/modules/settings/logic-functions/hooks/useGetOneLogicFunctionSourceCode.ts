import { useQuery } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE } from '@/settings/logic-functions/graphql/queries/findOneLogicFunctionSourceCode';
import {
  type FindOneLogicFunctionSourceCodeQuery,
  type FindOneLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetOneLogicFunctionSourceCode = ({
  id,
  version,
  onCompleted,
}: {
  id: string;
  version: string;
  onCompleted?: (data: FindOneLogicFunctionSourceCodeQuery) => void;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    FindOneLogicFunctionSourceCodeQuery,
    FindOneLogicFunctionSourceCodeQueryVariables
  >(FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id, version },
    },
    onCompleted,
    fetchPolicy: 'network-only',
  });
  return { code: data?.getLogicFunctionSourceCode, loading };
};
