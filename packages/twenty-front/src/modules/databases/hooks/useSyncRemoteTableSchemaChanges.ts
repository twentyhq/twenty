import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';

import { SYNC_REMOTE_TABLE_SCHEMA_CHANGES } from '@/databases/graphql/mutations/syncRemoteTableSchemaChanges';
import { GET_MANY_REMOTE_TABLES } from '@/databases/graphql/queries/findManyRemoteTables';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  RemoteTableInput,
  SyncRemoteTableMutation,
  SyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';

export const useSyncRemoteTableSchemaChanges = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    SyncRemoteTableMutation,
    SyncRemoteTableMutationVariables
  >(SYNC_REMOTE_TABLE_SCHEMA_CHANGES, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const syncRemoteTableSchemaChanges = useCallback(
    async (input: RemoteTableInput) => {
      const remoteTable = await mutate({
        variables: {
          input,
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: GET_MANY_REMOTE_TABLES,
            variables: {
              input: {
                id: input.remoteServerId,
                shouldFetchPendingSchemaUpdates: true,
              },
            },
          },
        ],
      });

      return remoteTable;
    },
    [mutate],
  );

  return {
    syncRemoteTableSchemaChanges,
  };
};
