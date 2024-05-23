import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';

import { SYNC_REMOTE_TABLE_SCHEMA_CHANGES } from '@/databases/graphql/mutations/syncRemoteTableSchemaChanges';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRecordTableFromCache';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  RemoteTableInput,
  SyncRemoteTableSchemaChangesMutation,
  SyncRemoteTableSchemaChangesMutationVariables,
} from '~/generated-metadata/graphql';
export const useSyncRemoteTableSchemaChanges = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate, mutationInformation] = useMutation<
    SyncRemoteTableSchemaChangesMutation,
    SyncRemoteTableSchemaChangesMutationVariables
  >(SYNC_REMOTE_TABLE_SCHEMA_CHANGES, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const syncRemoteTableSchemaChanges = useCallback(
    async (input: RemoteTableInput) => {
      const remoteTable = await mutate({
        variables: {
          input,
        },
        update: (cache) => {
          modifyRemoteTableFromCache({
            cache: cache,
            remoteTableName: input.name,
            fieldModifiers: {
              schemaPendingUpdates: () => [],
            },
          });
        },
      });

      return remoteTable;
    },
    [mutate],
  );

  return {
    syncRemoteTableSchemaChanges,
    isLoading: mutationInformation.loading,
  };
};
