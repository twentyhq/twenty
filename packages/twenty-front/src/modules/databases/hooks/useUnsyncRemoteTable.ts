import { useMutation } from '@apollo/client';
import { useCallback } from 'react';

import { UNSYNC_REMOTE_TABLE } from '@/databases/graphql/mutations/unsyncRemoteTable';
import { modifyRemoteTableFromCache } from '@/databases/utils/modifyRemoteTableFromCache';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import {
  type RemoteTableInput,
  type UnsyncRemoteTableMutation,
  type UnsyncRemoteTableMutationVariables,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useUnsyncRemoteTable = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const { refetch: refetchObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [mutate] = useMutation<
    UnsyncRemoteTableMutation,
    UnsyncRemoteTableMutationVariables
  >(UNSYNC_REMOTE_TABLE, {
    client: apolloMetadataClient,
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
