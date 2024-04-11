import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { SYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/syncRemoteTable';
import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  RemoteTableInput,
  SyncRemoteTableMutation,
  SyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';

export const useSyncRemoteTable = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    SyncRemoteTableMutation,
    SyncRemoteTableMutationVariables
  >(SYNC_REMOTE_TABLE, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const syncRemoteTable = useCallback(
    async (input: RemoteTableInput) => {
      return await mutate({
        variables: {
          input,
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_MANY_REMOTE_TABLES) ?? ''],
      });
    },
    [mutate],
  );

  return {
    syncRemoteTable,
  };
};
