import { isDefined } from 'twenty-sdk/utils';

import { type GranolaFolderSelection } from 'src/front-components/types/granola-folder-selection.type';
import { type GranolaFoldersResult } from 'src/front-components/types/granola-folders-result.type';

export const computeGranolaFolderSelection = ({
  selectedFolderIds,
  pendingFolderIds,
}: Pick<
  GranolaFoldersResult,
  'selectedFolderIds' | 'pendingFolderIds'
>): GranolaFolderSelection => {
  const storedFolderIds = pendingFolderIds ?? selectedFolderIds;

  return {
    selectedFolderIds: storedFolderIds,
    policy: storedFolderIds.length > 0 ? 'SELECTED_FOLDERS' : 'ALL_FOLDERS',
    hasInaccessibleSelection: false,
    isSelectionPending: isDefined(pendingFolderIds),
  };
};
