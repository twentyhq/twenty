import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';

import { SYNC_REMOTE_TABLE_SCHEMA_CHANGES } from '@/databases/graphql/mutations/syncRemoteTableSchemaChanges';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRemoteTableFromCache';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import {
  RemoteTableInput,
  SyncRemoteTableSchemaChangesMutation,
  SyncRemoteTableSchemaChangesMutationVariables,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

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
        update: (cache, { data }) => {
          if (isDefined(data)) {
            modifyRemoteTableFromCache({
              cache: cache,
              remoteTableName: input.name,
              fieldModifiers: {
                schemaPendingUpdates: () =>
                  data.syncRemoteTableSchemaChanges.schemaPendingUpdates || [],
                status: () => data.syncRemoteTableSchemaChanges.status,
              },
            });
          }
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
