import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { CREATE_ONE_DATABASE_CONNECTION } from '@/databases/graphql/mutations/createOneDatabaseConnection';
import { GET_MANY_DATABASE_CONNECTIONS } from '@/databases/graphql/queries/findManyDatabaseConnections';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  CreateRemoteServerInput,
  CreateServerMutation,
  CreateServerMutationVariables,
} from '~/generated-metadata/graphql';

export const useCreateOneDatabaseConnection = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateServerMutation,
    CreateServerMutationVariables
  >(CREATE_ONE_DATABASE_CONNECTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneDatabaseConnection = async (
    input: CreateRemoteServerInput,
  ) => {
    return await mutate({
      variables: {
        input,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_MANY_DATABASE_CONNECTIONS) ?? ''],
    });
  };

  return {
    createOneDatabaseConnection,
  };
};
