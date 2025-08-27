import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { PUBLISH_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/publishOneServerlessFunction';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import {
  type PublishOneServerlessFunctionMutation,
  type PublishOneServerlessFunctionMutationVariables,
  type PublishServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const usePublishOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const [mutate] = useMutation<
    PublishOneServerlessFunctionMutation,
    PublishOneServerlessFunctionMutationVariables
  >(PUBLISH_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const publishOneServerlessFunction = async (
    input: PublishServerlessFunctionInput,
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

  return { publishOneServerlessFunction };
};
