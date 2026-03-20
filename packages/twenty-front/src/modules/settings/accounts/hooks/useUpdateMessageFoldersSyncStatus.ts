import { useCallback } from 'react';

import { UPDATE_MESSAGE_FOLDER } from '@/settings/accounts/graphql/mutations/updateMessageFolder';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client/react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';

type UpdateMessageFoldersSyncStatusArgs = {
  messageFolderIds: string[];
  isSynced: boolean;
};

export const useUpdateMessageFoldersSyncStatus = () => {
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const apolloClient = useApolloClient();

  const { updateManyRecords } = useUpdateManyRecords({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
    recordGqlFields: {
      id: true,
      isSynced: true,
    },
  });

  const updateMessageFoldersSyncStatus = useCallback(
    async ({
      messageFolderIds,
      isSynced,
    }: UpdateMessageFoldersSyncStatusArgs) => {
      if (isMigrated) {
        const BATCH_SIZE = 10;
        const errors: unknown[] = [];

        for (
          let index = 0;
          index < messageFolderIds.length;
          index += BATCH_SIZE
        ) {
          const batch = messageFolderIds.slice(index, index + BATCH_SIZE);
          const results = await Promise.allSettled(
            batch.map((folderId) =>
              apolloClient.mutate({
                mutation: UPDATE_MESSAGE_FOLDER,
                variables: {
                  input: {
                    id: folderId,
                    update: { isSynced },
                  },
                },
              }),
            ),
          );

          for (const result of results) {
            if (result.status === 'rejected') {
              errors.push(result.reason);
            }
          }
        }

        if (errors.length > 0) {
          throw new Error('Failed to update some message folders sync status.');
        }

        return;
      }

      await updateManyRecords({
        recordIdsToUpdate: messageFolderIds,
        updateOneRecordInput: { isSynced },
      });
    },
    [isMigrated, apolloClient, updateManyRecords],
  );

  return { updateMessageFoldersSyncStatus };
};
