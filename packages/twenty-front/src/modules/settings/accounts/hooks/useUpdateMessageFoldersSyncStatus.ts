import { useCallback } from 'react';

import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';
import { UPDATE_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/mutations/updateMessageFolders';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client/react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

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
        if (messageFolderIds.length === 0) {
          return;
        }

        await apolloClient.mutate({
          mutation: UPDATE_MESSAGE_FOLDERS,
          variables: {
            input: {
              ids: messageFolderIds,
              update: { isSynced },
            },
          },
          optimisticResponse: {
            updateMessageFolders: messageFolderIds.map((id) => ({
              __typename: 'MessageFolder',
              id,
              isSynced,
            })),
          },
        });

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
