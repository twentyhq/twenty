import { type GranolaFolderSelection } from 'src/front-components/types/granola-folder-selection.type';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export const dropInaccessibleGranolaFolders = ({
  selection,
  folders,
}: {
  selection: GranolaFolderSelection;
  folders: Pick<GranolaSettingsFolder, 'id'>[];
}): GranolaFolderSelection => {
  const accessibleFolderIds = new Set(folders.map((folder) => folder.id));
  const accessibleSelectedFolderIds = selection.selectedFolderIds.filter(
    (folderId) => accessibleFolderIds.has(folderId),
  );

  return {
    ...selection,
    selectedFolderIds: accessibleSelectedFolderIds,
    hasInaccessibleSelection:
      selection.selectedFolderIds.length > 0 &&
      accessibleSelectedFolderIds.length === 0,
  };
};
