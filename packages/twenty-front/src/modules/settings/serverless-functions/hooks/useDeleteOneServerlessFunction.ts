import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { DELETE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/deleteOneServerlessFunction';
import { useMutation } from '@apollo/client';
import {
  DeleteOneServerlessFunctionMutation,
  DeleteOneServerlessFunctionMutationVariables,
  ServerlessFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useDeleteOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
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
    });
  };

  return { deleteOneServerlessFunction };
};
