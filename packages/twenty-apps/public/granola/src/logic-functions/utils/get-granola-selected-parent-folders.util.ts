import { isDefined } from 'twenty-sdk/utils';

import { type GranolaFolder } from 'src/logic-functions/types/granola-api.type';

export const getGranolaSelectedParentFolders = ({
  folderIds,
  folders,
}: {
  folderIds: string[];
  folders: Pick<GranolaFolder, 'id' | 'parent_folder_id'>[];
}): string[] => {
  const selectedIds = new Set(folderIds);
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));

  // A folder inside its own ancestry chain stays selected rather than collapsing the selection to every folder.
  const hasSelectedAncestor = (folderId: string): boolean => {
    const visited = new Set<string>();
    let isSelectedAncestorFound = false;
    let parentId = foldersById.get(folderId)?.parent_folder_id;

    while (isDefined(parentId)) {
      if (parentId === folderId) {
        return false;
      }

      if (visited.has(parentId)) {
        return isSelectedAncestorFound;
      }

      visited.add(parentId);
      isSelectedAncestorFound ||= selectedIds.has(parentId);
      parentId = foldersById.get(parentId)?.parent_folder_id;
    }

    return isSelectedAncestorFound;
  };

  return [...selectedIds].filter((folderId) => !hasSelectedAncestor(folderId));
};
