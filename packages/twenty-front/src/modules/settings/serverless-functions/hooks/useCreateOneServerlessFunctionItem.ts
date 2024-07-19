import { ApolloClient, useMutation } from '@apollo/client';

import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { CreateServerlessFunctionInput } from '~/generated-metadata/graphql';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { CREATE_ONE_SERVERLESS_FUNCTION_ITEM } from '@/settings/serverless-functions/graphql/mutations/createOneServerlessFunctionItem';

export const useCreateOneServerlessFunctionItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation(CREATE_ONE_SERVERLESS_FUNCTION_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneServerlessFunctionItem = async (
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

  return { createOneServerlessFunctionItem };
};
