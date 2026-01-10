import { useMutation } from '@apollo/client';

import { TRIGGER_MESSAGE_FOLDER_SYNC } from '@/settings/accounts/graphql/mutations/triggerMessageFolderSync';

type TriggerMessageFolderSyncMutation = {
  triggerMessageFolderSync: {
    success: boolean;
  };
};

type TriggerMessageFolderSyncMutationVariables = {
  messageFolderId: string;
};

export const useTriggerMessageFolderSync = () => {
  return useMutation<
    TriggerMessageFolderSyncMutation,
    TriggerMessageFolderSyncMutationVariables
  >(TRIGGER_MESSAGE_FOLDER_SYNC);
};
