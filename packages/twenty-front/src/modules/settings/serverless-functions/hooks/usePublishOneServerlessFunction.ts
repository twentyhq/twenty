import { ApolloClient, useMutation } from '@apollo/client';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { PUBLISH_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/publishOneServerlessFunction';
import {
  PublishServerlessFunctionInput,
  PublishOneServerlessFunctionMutation,
  PublishOneServerlessFunctionMutationVariables,
} from '~/generated-metadata/graphql';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';

export const usePublishOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    PublishOneServerlessFunctionMutation,
    PublishOneServerlessFunctionMutationVariables
  >(PUBLISH_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
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
