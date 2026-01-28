import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/queries/findOneLogicFunction';
import { useQuery } from '@apollo/client';
import {
  type GetOneLogicFunctionQuery,
  type GetOneLogicFunctionQueryVariables,
  type LogicFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetOneLogicFunction = ({
  id,
  onCompleted,
}: LogicFunctionIdInput & {
  onCompleted?: (data: GetOneLogicFunctionQuery) => void;
}) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data, loading } = useQuery<
    GetOneLogicFunctionQuery,
    GetOneLogicFunctionQueryVariables
  >(FIND_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input: { id },
    },
    onCompleted,
  });
  return {
    logicFunction: data?.findOneLogicFunction || null,
    loading,
  };
};
