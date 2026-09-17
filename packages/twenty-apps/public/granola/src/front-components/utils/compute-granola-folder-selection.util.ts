import { isDefined } from 'twenty-sdk/utils';

import { type GranolaFolderSelection } from 'src/front-components/types/granola-folder-selection.type';
import { type GranolaFoldersResult } from 'src/front-components/types/granola-folders-result.type';

export const computeGranolaFolderSelection = ({
  folders,
  selectedFolderIds,
  pendingFolderIds,
}: GranolaFoldersResult): GranolaFolderSelection => {
  const accessibleFolderIds = new Set(folders.map((folder) => folder.id));
  const storedFolderIds = pendingFolderIds ?? selectedFolderIds;
  const accessibleSelectedFolderIds = storedFolderIds.filter((folderId) =>
    accessibleFolderIds.has(folderId),
  );

  return {
    selectedFolderIds: accessibleSelectedFolderIds,
    policy: storedFolderIds.length > 0 ? 'SELECTED_FOLDERS' : 'ALL_FOLDERS',
    hasInaccessibleSelection:
      storedFolderIds.length > 0 && accessibleSelectedFolderIds.length === 0,
    isSelectionPending: isDefined(pendingFolderIds),
  };
};
