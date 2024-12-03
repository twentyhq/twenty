import { useMutation } from '@apollo/client';

import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { CREATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/createOneServerlessFunction';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { getOperationName } from '@apollo/client/utilities';
import {
  CreateOneServerlessFunctionItemMutation,
  CreateOneServerlessFunctionItemMutationVariables,
  CreateServerlessFunctionInput,
} from '~/generated-metadata/graphql';

export const useCreateOneServerlessFunction = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    CreateOneServerlessFunctionItemMutation,
    CreateOneServerlessFunctionItemMutationVariables
  >(CREATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const createOneServerlessFunction = async (
    input: CreateServerlessFunctionInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_SERVERLESS_FUNCTIONS) ?? ''],
    });
  };

  return { createOneServerlessFunction };
};
