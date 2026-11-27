import { isDefined } from 'twenty-sdk/utils';

import { loadGranolaPersonalFolderSettings } from 'src/logic-functions/utils/load-granola-personal-folder-settings.util';

export const loadGranolaPersonalFolders = async ({
  connectionId,
  userWorkspaceId,
}: {
  connectionId: string;
  userWorkspaceId: string;
}) => {
  const settings = await loadGranolaPersonalFolderSettings({
    connectionId,
    userWorkspaceId,
  });

  if (!isDefined(settings)) {
    return undefined;
  }

  const { folders, selection } = settings;
  const availableFolderIds = new Set(folders.map(({ id }) => id));

  return {
    folders,
    folderIds: selection
      .map(({ folderId }) => folderId)
      .filter((folderId) => availableFolderIds.has(folderId)),
  };
};
