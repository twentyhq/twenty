import { type MessageFolder } from '@/accounts/types/MessageFolder';

export const computeFolderIdsForSyncToggle = (
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

  const collectChildren = (id: string): string[] => {
    const folder = folderById.get(id);
    const children = folder?.externalId
      ? allFolders.filter((f) => f.parentFolderId === folder.externalId)
      : [];

    return [id, ...children.flatMap((child) => collectChildren(child.id))];
  };

  const collectParents = (id: string): MessageFolder[] => {
    const parents: MessageFolder[] = [];
    let current = folderById.get(id);

    while (current?.parentFolderId) {
      const parent = folderByExternalId.get(current.parentFolderId);

      if (!parent) break;
      parents.push(parent);
      current = parent;
    }

    return parents;
  };

  const childIds = collectChildren(folderId);

  if (isSyncing) {
    const parentIds = collectParents(folderId).map((folder) => folder.id);

    return [...new Set([...childIds, ...parentIds])];
  }

  const idsToUnsync = new Set(childIds);

  for (const parent of collectParents(folderId)) {
    const children = allFolders.filter(
      (folder) => folder.parentFolderId === parent.externalId,
    );
    const hasOtherSyncedChild = children.some(
      (child) => child.isSynced && !idsToUnsync.has(child.id),
    );

    if (hasOtherSyncedChild) break;
    idsToUnsync.add(parent.id);
  }

  return [...idsToUnsync];
};
