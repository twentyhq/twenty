import { isDefined } from 'twenty-sdk/utils';

import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';

export type GranolaFolderTreeNode = {
  folder: GranolaSettingsFolder;
  children: GranolaFolderTreeNode[];
};

const compareByName = (
  left: GranolaSettingsFolder,
  right: GranolaSettingsFolder,
) => left.name.localeCompare(right.name);

export const computeGranolaFolderTree = (
  folders: GranolaSettingsFolder[],
): GranolaFolderTreeNode[] => {
  const folderIds = new Set(folders.map((folder) => folder.id));
  const childrenByParentId = new Map<string, GranolaSettingsFolder[]>();
  const rootFolders: GranolaSettingsFolder[] = [];

  for (const folder of folders) {
    const parentId = folder.parent_folder_id;

    if (
      !isDefined(parentId) ||
      parentId === folder.id ||
      !folderIds.has(parentId)
    ) {
      rootFolders.push(folder);
      continue;
    }

    childrenByParentId.set(parentId, [
      ...(childrenByParentId.get(parentId) ?? []),
      folder,
    ]);
  }

  const visitedIds = new Set<string>();

  const buildNode = (folder: GranolaSettingsFolder): GranolaFolderTreeNode => {
    visitedIds.add(folder.id);

    const children = (childrenByParentId.get(folder.id) ?? [])
      .filter((child) => !visitedIds.has(child.id))
      .sort(compareByName);

    return { folder, children: children.map(buildNode) };
  };

  const tree = rootFolders.sort(compareByName).map(buildNode);

  // Folders whose ancestry loops never reach a root, so they surface at the top level.
  const unreachableFolders = folders
    .filter((folder) => !visitedIds.has(folder.id))
    .sort(compareByName);

  for (const folder of unreachableFolders) {
    if (!visitedIds.has(folder.id)) {
      tree.push(buildNode(folder));
    }
  }

  return tree;
};
