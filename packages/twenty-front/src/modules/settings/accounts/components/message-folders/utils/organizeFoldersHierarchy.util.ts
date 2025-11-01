import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { isDefined } from 'twenty-shared/utils';

export type HierarchicalFolder = {
  folder: MessageFolder;
  children: HierarchicalFolder[];
  level: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  hasMoreSiblings: boolean;
};

type FlatHierarchicalFolder = Omit<HierarchicalFolder, 'children'> & {
  parentChain: boolean[];
};

export const organizeFoldersHierarchy = (
  folders: MessageFolder[],
): FlatHierarchicalFolder[] => {
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

  const result: FlatHierarchicalFolder[] = [];

  const buildHierarchy = (
    folder: MessageFolder,
    level: number,
    isFirstChild: boolean,
    isLastChild: boolean,
    parentChain: boolean[],
  ) => {
    result.push({
      folder,
      level,
      isFirstChild,
      isLastChild,
      hasMoreSiblings: !isLastChild,
      parentChain: [...parentChain],
    });

    const children = childrenMap.get(folder.id) || [];
    const childCount = children.length;

    children.forEach((child, index) => {
      const newParentChain = [...parentChain, !isLastChild];
      buildHierarchy(
        child,
        level + 1,
        index === 0,
        index === childCount - 1,
        newParentChain,
      );
    });
  };

  const rootFolders = folders.filter((f) => {
    if (!f.parentFolderId) return true;

    return !folderByExternalIdMap.has(f.parentFolderId);
  });

  rootFolders.sort((a, b) => a.name.localeCompare(b.name));

  const rootCount = rootFolders.length;
  rootFolders.forEach((folder, index) => {
    buildHierarchy(folder, 0, index === 0, index === rootCount - 1, []);
  });

  return result;
};
