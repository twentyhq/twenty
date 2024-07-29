import { ApolloClient, useMutation } from '@apollo/client';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import {
  UpdateServerlessFunctionInput,
  UpdateOneServerlessFunctionMutation,
  UpdateOneServerlessFunctionMutationVariables,
} from '~/generated-metadata/graphql';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';

export const useUpdateOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    UpdateOneServerlessFunctionMutation,
    UpdateOneServerlessFunctionMutationVariables
  >(UPDATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const updateOneServerlessFunction = async (
    input: UpdateServerlessFunctionInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_SERVERLESS_FUNCTIONS) ?? ''],
    });
  };

  return { updateOneServerlessFunction };
};
