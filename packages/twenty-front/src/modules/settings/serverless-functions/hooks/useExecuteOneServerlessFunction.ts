import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { EXECUTE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/executeOneServerlessFunction';
import { useMutation } from '@apollo/client';
import {
  ExecuteOneServerlessFunctionMutation,
  ExecuteOneServerlessFunctionMutationVariables,
  ExecuteServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const useExecuteOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
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
