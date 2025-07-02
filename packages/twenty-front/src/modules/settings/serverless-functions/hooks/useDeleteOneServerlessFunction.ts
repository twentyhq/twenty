import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DELETE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/deleteOneServerlessFunction';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import {
  DeleteOneServerlessFunctionMutation,
  DeleteOneServerlessFunctionMutationVariables,
  ServerlessFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useDeleteOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    DeleteOneServerlessFunctionMutation,
    DeleteOneServerlessFunctionMutationVariables
  >(DELETE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const deleteOneServerlessFunction = async (
    input: ServerlessFunctionIdInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [
        getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
      ],
    });
  };

  return { deleteOneServerlessFunction };
};
