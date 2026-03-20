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
        await Promise.all(
          messageFolderIds.map((folderId) =>
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
