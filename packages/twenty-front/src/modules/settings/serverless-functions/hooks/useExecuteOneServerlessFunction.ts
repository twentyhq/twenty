import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { EXECUTE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/executeOneServerlessFunction';
import { useMutation } from '@apollo/client';
import {
  type ExecuteOneServerlessFunctionMutation,
  type ExecuteOneServerlessFunctionMutationVariables,
  type ExecuteServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const useExecuteOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    ExecuteOneServerlessFunctionMutation,
    ExecuteOneServerlessFunctionMutationVariables
  >(EXECUTE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const executeOneServerlessFunction = async (
    input: ExecuteServerlessFunctionInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
    });
  };
  return { executeOneServerlessFunction };
};
