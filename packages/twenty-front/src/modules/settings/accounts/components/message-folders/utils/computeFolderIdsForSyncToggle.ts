import { type MessageFolder } from '@/accounts/types/MessageFolder';

export const computeFolderIdsForSyncToggle = ({
  folderId,
  allFolders,
  isSynced,
}: {
  folderId: string;
  allFolders: MessageFolder[];
  isSynced: boolean;
}): string[] => {
  const folderById = new Map(allFolders.map((folder) => [folder.id, folder]));
  const folderByExternalId = new Map(
    allFolders.map((folder) => [folder.externalId, folder]),
  );

  const collectChildren = (id: string): string[] => {
    const folder = folderById.get(id);
    const children = folder?.externalId
      ? allFolders.filter(
          (childFolder) => childFolder.parentFolderId === folder.externalId,
        )
      : [];

    return [id, ...children.flatMap((child) => collectChildren(child.id))];
  };

  const collectParents = (id: string): MessageFolder[] => {
    const parents: MessageFolder[] = [];
    let current = folderById.get(id);

    while (true) {
      if (!current) {
        break;
      }

      if (!current.parentFolderId) {
        break;
      }

      const parent = folderByExternalId.get(current.parentFolderId);

      if (!parent) {
        break;
      }

      parents.push(parent);
      current = parent;
    }

    return parents;
  };

  const childIds = collectChildren(folderId);

  if (isSynced) {
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
