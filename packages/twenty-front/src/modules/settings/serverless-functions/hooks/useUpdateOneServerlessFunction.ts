import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import {
  type UpdateOneServerlessFunctionMutation,
  type UpdateOneServerlessFunctionMutationVariables,
  type UpdateServerlessFunctionInputUpdates,
} from '~/generated-metadata/graphql';

export const useUpdateOneServerlessFunction = (
  serverlessFunctionId: string,
) => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    UpdateOneServerlessFunctionMutation,
    UpdateOneServerlessFunctionMutationVariables
  >(UPDATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const updateOneServerlessFunction = async (
    update: UpdateServerlessFunctionInputUpdates,
  ) => {
    return await mutate({
      variables: {
        input: { update, id: serverlessFunctionId },
      },
      refetchQueries: [
        getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
      ],
    });
  };

  return { updateOneServerlessFunction };
};
