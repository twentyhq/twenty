import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { useQuery } from '@apollo/client';
import { type Sources } from 'twenty-shared/types';
import {
  type GetLogicFunctionSourceCodeQuery,
  type GetLogicFunctionSourceCodeQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetLogicFunctionSourceCode = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}): { code: Sources | null; loading: boolean } => {
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

  const raw = data?.getLogicFunctionSourceCode;
  const code =
    raw != null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Sources)
      : null;

  return { code, loading };
};
