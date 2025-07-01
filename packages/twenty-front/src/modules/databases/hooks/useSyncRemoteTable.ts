import { useApolloClient, useMutation } from '@apollo/client';
import { useCallback } from 'react';

import { SYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/syncRemoteTable';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRemoteTableFromCache';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import {
  RemoteTableInput,
  SyncRemoteTableMutation,
  SyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useSyncRemoteTable = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const apolloClient = useApolloClient();

  const { refetch: refetchObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const { findManyRecordsQuery: findManyViewsQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.View,
  });
  const [mutate] = useMutation<
    SyncRemoteTableMutation,
    SyncRemoteTableMutationVariables
  >(SYNC_REMOTE_TABLE, {
    client: apolloMetadataClient,
  });

  const syncRemoteTable = useCallback(
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
                status: () => data.syncRemoteTable.status,
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
    [apolloClient, findManyViewsQuery, mutate, refetchObjectMetadataItems],
  );

  return {
    syncRemoteTable,
  };
};
