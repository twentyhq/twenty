import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { isDefined } from 'twenty-shared/utils';

export type MessageFolderTreeNode = {
  folder: MessageFolder;
  children: MessageFolderTreeNode[];
  hasChildren: boolean;
};

export const computeMessageFolderTree = (
  folders: MessageFolder[],
): MessageFolderTreeNode[] => {
  const folderByExternalIdMap = new Map<string, MessageFolder>();
  const childrenMap = new Map<string, MessageFolder[]>();

  folders.forEach((folder) => {
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

  const buildTreeNode = (folder: MessageFolder): MessageFolderTreeNode => {
    const children = childrenMap.get(folder.id) || [];
    const sortedChildren = [...children].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      folder,
      children: sortedChildren.map((child) => buildTreeNode(child)),
      hasChildren: children.length > 0,
    };
  };

  const rootFolders = folders.filter((folder) => {
    if (!folder.parentFolderId) return true;

    return !folderByExternalIdMap.has(folder.parentFolderId);
  });

  rootFolders.sort((a, b) => a.name.localeCompare(b.name));

  return rootFolders.map((folder) => buildTreeNode(folder));
};
