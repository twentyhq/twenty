import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { isDefined } from 'twenty-shared/utils';

export type HierarchicalFolder = {
  folder: MessageFolder;
  children: HierarchicalFolder[];
  hasChildren: boolean;
};

export const organizeFoldersHierarchy = (
  folders: MessageFolder[],
): HierarchicalFolder[] => {
  const folderMap = new Map<string, MessageFolder>();
  const folderByExternalIdMap = new Map<string, MessageFolder>();
  const childrenMap = new Map<string, MessageFolder[]>();

  folders.forEach((folder) => {
    folderMap.set(folder.id, folder);
    if (isDefined(folder.externalId)) {
      folderByExternalIdMap.set(folder.externalId, folder);
    }
  });

  folders.forEach((folder) => {
    if (isDefined(folder.parentFolderId)) {
      const parent = folderByExternalIdMap.get(folder.parentFolderId);
      if (isDefined(parent)) {
        const siblings = childrenMap.get(parent.id) || [];
        siblings.push(folder);
        childrenMap.set(parent.id, siblings);
      }
    }
  });

  const buildHierarchy = (folder: MessageFolder): HierarchicalFolder => {
    const children = childrenMap.get(folder.id) || [];
    const sortedChildren = [...children].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      folder,
      children: sortedChildren.map((child) => buildHierarchy(child)),
      hasChildren: children.length > 0,
    };
  };

  const rootFolders = folders.filter((folder) => {
    if (!folder.parentFolderId) return true;

    return !folderByExternalIdMap.has(folder.parentFolderId);
  });

  rootFolders.sort((a, b) => a.name.localeCompare(b.name));

  return rootFolders.map((folder) => buildHierarchy(folder));
};
