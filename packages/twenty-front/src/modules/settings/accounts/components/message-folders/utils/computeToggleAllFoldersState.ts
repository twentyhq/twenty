import { type MessageFolder } from '@/accounts/types/MessageFolder';

export const computeToggleAllFoldersState = (folders: MessageFolder[]) => {
  const allSynced =
    folders.length > 0 && folders.every((folder) => folder.isSynced);

  return {
    allSynced,
    messageFolderIds: folders.map((folder) => folder.id),
    targetSyncState: !allSynced,
  };
};
