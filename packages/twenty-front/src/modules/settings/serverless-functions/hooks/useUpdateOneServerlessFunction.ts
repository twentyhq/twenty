import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import {
  UpdateOneServerlessFunctionMutation,
  UpdateOneServerlessFunctionMutationVariables,
  UpdateServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const useUpdateOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    UpdateOneServerlessFunctionMutation,
    UpdateOneServerlessFunctionMutationVariables
  >(UPDATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const updateOneServerlessFunction = async (
    input: UpdateServerlessFunctionInput,
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

  return { updateOneServerlessFunction };
};
