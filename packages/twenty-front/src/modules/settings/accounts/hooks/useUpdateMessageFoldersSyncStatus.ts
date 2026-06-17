import { useCallback } from 'react';

import { UPDATE_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/mutations/updateMessageFolders';
import { useApolloClient } from '@apollo/client/react';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

type UpdateMessageFoldersSyncStatusArgs = {
  messageFolderIds: string[];
  isSynced: boolean;
};

export const useUpdateMessageFoldersSyncStatus = () => {
  const apolloClient = useApolloClient();

  const updateMessageFoldersSyncStatus = useCallback(
    async ({
      messageFolderIds,
      isSynced,
    }: UpdateMessageFoldersSyncStatusArgs) => {
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
            pendingSyncAction: isSynced
              ? MessageFolderPendingSyncAction.FOLDER_IMPORT
              : MessageFolderPendingSyncAction.NONE,
          })),
        },
      });
    },
    [apolloClient],
  );

  return { updateMessageFoldersSyncStatus };
};
