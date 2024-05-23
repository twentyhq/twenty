import { useCallback } from 'react';
import { ApolloClient, useMutation } from '@apollo/client';

import { UNSYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/unsyncRemoteTable';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRemoteTableFromCache';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import {
  RemoteTableInput,
  UnsyncRemoteTableMutation,
  UnsyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useUnsyncRemoteTable = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { refetch: refetchObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [mutate] = useMutation<
    UnsyncRemoteTableMutation,
    UnsyncRemoteTableMutationVariables
  >(UNSYNC_REMOTE_TABLE, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const unsyncRemoteTable = useCallback(
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
                status: () => data.unsyncRemoteTable.status,
              },
            });
          }
        },
      });

      await refetchObjectMetadataItems();

      return remoteTable;
    },
    [mutate, refetchObjectMetadataItems],
  );

  return {
    unsyncRemoteTable,
  };
};
