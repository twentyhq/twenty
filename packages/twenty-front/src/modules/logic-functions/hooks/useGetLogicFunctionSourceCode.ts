import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { useQuery } from '@apollo/client';
import {
  type GetLogicFunctionSourceCodeQuery,
  type GetLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetLogicFunctionSourceCode = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    GetLogicFunctionSourceCodeQuery,
    GetLogicFunctionSourceCodeQueryVariables
  >(GET_LOGIC_FUNCTION_SOURCE_CODE, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id: logicFunctionId },
    },
    skip: !logicFunctionId,
  });

  return { code: data?.getLogicFunctionSourceCode, loading };
};
