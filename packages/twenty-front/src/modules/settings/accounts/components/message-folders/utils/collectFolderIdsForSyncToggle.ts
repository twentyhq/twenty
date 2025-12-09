import { type MessageFolder } from '@/accounts/types/MessageFolder';

export const collectFolderIdsForSyncToggle = (
  folderId: string,
  allFolders: MessageFolder[],
  isSyncing: boolean,
): string[] => {
  const folderById = new Map(allFolders.map((folder) => [folder.id, folder]));
  const folderByExternalId = new Map(
    allFolders
      .filter((folder) => folder.externalId)
      .map((folder) => [folder.externalId, folder]),
  );

  const collectDescendants = (id: string): string[] => {
    const folder = folderById.get(id);
    const children = folder?.externalId
      ? allFolders.filter((f) => f.parentFolderId === folder.externalId)
      : [];

    return [id, ...children.flatMap((child) => collectDescendants(child.id))];
  };

  const collectAncestors = (id: string): MessageFolder[] => {
    const ancestors: MessageFolder[] = [];
    let current = folderById.get(id);

    while (current?.parentFolderId) {
      const parent = folderByExternalId.get(current.parentFolderId);

      if (!parent) break;
      ancestors.push(parent);
      current = parent;
    }

    return ancestors;
  };

  const descendantIds = collectDescendants(folderId);

  if (isSyncing) {
    const ancestorIds = collectAncestors(folderId).map((folder) => folder.id);

    return [...new Set([...descendantIds, ...ancestorIds])];
  }

  const idsToUnsync = new Set(descendantIds);

  for (const ancestor of collectAncestors(folderId)) {
    const children = allFolders.filter(
      (folder) => folder.parentFolderId === ancestor.externalId,
    );
    const hasOtherSyncedChild = children.some(
      (child) => child.isSynced && !idsToUnsync.has(child.id),
    );

    if (hasOtherSyncedChild) break;
    idsToUnsync.add(ancestor.id);
  }

  return [...idsToUnsync];
};
