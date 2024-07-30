import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { DELETE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/deleteOneServerlessFunction';
import {
  DeleteServerlessFunctionInput,
  DeleteOneServerlessFunctionMutation,
  DeleteOneServerlessFunctionMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeleteOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    DeleteOneServerlessFunctionMutation,
    DeleteOneServerlessFunctionMutationVariables
  >(DELETE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneServerlessFunction = async (
    input: DeleteServerlessFunctionInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_SERVERLESS_FUNCTIONS) ?? ''],
    });
  };

  return { deleteOneServerlessFunction };
};
