import { FIND_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/queries/findOneLogicFunction';
import { useQuery } from '@apollo/client';
import {
  type FindOneLogicFunctionQuery,
  type FindOneLogicFunctionQueryVariables,
  type LogicFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetOneLogicFunction = ({
  id,
  onCompleted,
}: LogicFunctionIdInput & {
  onCompleted?: (data: FindOneLogicFunctionQuery) => void;
}) => {
  const { data, loading } = useQuery<
    FindOneLogicFunctionQuery,
    FindOneLogicFunctionQueryVariables
  >(FIND_ONE_LOGIC_FUNCTION, {
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
