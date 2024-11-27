import { useApolloClient, useMutation } from '@apollo/client';
import { useCallback } from 'react';

import { SYNC_REMOTE_TABLE_SCHEMA_CHANGES } from '@/databases/graphql/mutations/syncRemoteTableSchemaChanges';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRemoteTableFromCache';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import {
  RemoteTableInput,
  SyncRemoteTableSchemaChangesMutation,
  SyncRemoteTableSchemaChangesMutationVariables,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useSyncRemoteTableSchemaChanges = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const apolloClient = useApolloClient();

  const { refetch: refetchObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const { findManyRecordsQuery: findManyViewsQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const [mutate, mutationInformation] = useMutation<
    SyncRemoteTableSchemaChangesMutation,
    SyncRemoteTableSchemaChangesMutationVariables
  >(SYNC_REMOTE_TABLE_SCHEMA_CHANGES, {
    client: apolloMetadataClient,
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

      await refetchObjectMetadataItems();

      await apolloClient.query({
        query: findManyViewsQuery,
        fetchPolicy: 'network-only',
      });

      return remoteTable;
    },
    [mutate, refetchObjectMetadataItems, findManyViewsQuery, apolloClient],
  );

  return {
    syncRemoteTableSchemaChanges,
    isLoading: mutationInformation.loading,
  };
};
