import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { PUBLISH_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/publishOneLogicFunction';
import { FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE } from '@/settings/logic-functions/graphql/queries/findOneLogicFunctionSourceCode';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import {
  type PublishOneLogicFunctionMutation,
  type PublishOneLogicFunctionMutationVariables,
  type PublishLogicFunctionInput,
} from '~/generated-metadata/graphql';

export const usePublishOneLogicFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    PublishOneLogicFunctionMutation,
    PublishOneLogicFunctionMutationVariables
  >(PUBLISH_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const publishOneLogicFunction = async (input: PublishLogicFunctionInput) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [
        getOperationName(FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE) ?? '',
      ],
    });
  };

  return { publishOneLogicFunction };
};
