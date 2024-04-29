import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { UPDATE_ONE_DATABASE_CONNECTION } from '@/databases/graphql/mutations/updateOneDatabaseConnection';
import { GET_MANY_DATABASE_CONNECTIONS } from '@/databases/graphql/queries/findManyDatabaseConnections';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  UpdateRemoteServerInput,
  UpdateServerMutation,
  UpdateServerMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateOneDatabaseConnection = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateServerMutation,
    UpdateServerMutationVariables
  >(UPDATE_ONE_DATABASE_CONNECTION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const updateOneDatabaseConnection = async (
    input: UpdateRemoteServerInput,
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
    updateOneDatabaseConnection,
  };
};
