import { isDefined } from 'twenty-sdk/utils';

import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export type GranolaFolderOption = {
  id: string;
  name: string;
  path: string;
  depth: number;
  ancestorIds: string[];
};

export const getGranolaFolderOptions = (
  folders: GranolaSettingsFolder[],
): GranolaFolderOption[] => {
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));

  return folders
    .map((folder) => {
      const names = [folder.name];
      const ancestorIds: string[] = [];
      const visitedIds = new Set([folder.id]);
      let parentId = folder.parent_folder_id;

      while (isDefined(parentId) && !visitedIds.has(parentId)) {
        visitedIds.add(parentId);
        const parent = foldersById.get(parentId);
        if (!isDefined(parent)) {
          break;
        }
        names.unshift(parent.name);
        ancestorIds.push(parent.id);
        parentId = parent.parent_folder_id;
      }

      return {
        id: folder.id,
        name: folder.name,
        path: names.join(' / '),
        depth: ancestorIds.length,
        ancestorIds,
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
};
