import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import { useMutation } from '@apollo/client';
import {
  UpdateOneServerlessFunctionMutation,
  UpdateOneServerlessFunctionMutationVariables,
  UpdateServerlessFunctionInput,
} from '~/generated-metadata/graphql';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';

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
    input: Omit<UpdateServerlessFunctionInput, 'id'>,
  ) => {
    return await mutate({
      variables: {
        input: { ...input, id: serverlessFunctionId },
      },
      refetchQueries: [
        getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
      ],
    });
  };

  return { updateOneServerlessFunction };
};
