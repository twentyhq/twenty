import { isDefined } from 'twenty-sdk/utils';

import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export type GranolaFolderOption = {
  id: string;
  name: string;
  path: string;
  depth: number;
  ancestorIds: string[];
};

// Joined paths interleave a child with a sibling whose name sorts between
// the parent name and the parent name followed by the separator.
const compareNamePaths = (left: string[], right: string[]): number => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const comparison = left[index].localeCompare(right[index]);

    if (comparison !== 0) {
      return comparison;
    }
  }

  return left.length - right.length;
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
        names,
        option: {
          id: folder.id,
          name: folder.name,
          path: names.join(' / '),
          depth: ancestorIds.length,
          ancestorIds,
        },
      };
    })
    .sort((left, right) => compareNamePaths(left.names, right.names))
    .map(({ option }) => option);
};
