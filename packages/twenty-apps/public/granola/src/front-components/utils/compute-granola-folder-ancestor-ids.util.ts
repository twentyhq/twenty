import { isDefined } from 'twenty-sdk/utils';

import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export const computeGranolaFolderAncestorIds = (
  folders: GranolaSettingsFolder[],
): Map<string, string[]> => {
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));

  return new Map(
    folders.map((folder) => {
      const ancestorIds: string[] = [];
      const visitedIds = new Set([folder.id]);
      let parentId = folder.parent_folder_id;

      while (isDefined(parentId) && !visitedIds.has(parentId)) {
        visitedIds.add(parentId);
        const parent = foldersById.get(parentId);

        if (!isDefined(parent)) {
          break;
        }

        ancestorIds.push(parent.id);
        parentId = parent.parent_folder_id;
      }

      return [folder.id, ancestorIds];
    }),
  );
};
