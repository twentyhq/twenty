import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { EXECUTE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/executeOneLogicFunction';
import { useMutation } from '@apollo/client';
import {
  type ExecuteOneLogicFunctionMutation,
  type ExecuteOneLogicFunctionMutationVariables,
  type ExecuteLogicFunctionInput,
} from '~/generated-metadata/graphql';

export const useExecuteOneLogicFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    ExecuteOneLogicFunctionMutation,
    ExecuteOneLogicFunctionMutationVariables
  >(EXECUTE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const executeOneLogicFunction = async (input: ExecuteLogicFunctionInput) => {
    return await mutate({
      variables: {
        input,
      },
    });
  };
  return { executeOneLogicFunction };
};
