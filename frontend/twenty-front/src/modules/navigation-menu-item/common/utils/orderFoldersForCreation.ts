export const orderFoldersForCreation = <
  T extends { id: string; folderId?: string | null },
>(
  folders: T[],
  existingIds: Set<string>,
): T[] => {
  const result: T[] = [];
  let remaining = [...folders];

  while (remaining.length > 0) {
    const readyIndex = remaining.findIndex(
      (folder) =>
        !folder.folderId ||
        existingIds.has(folder.folderId) ||
        result.some((r) => r.id === folder.folderId),
    );
    if (readyIndex === -1) break;

    const [ready] = remaining.splice(readyIndex, 1);
    result.push(ready);
  }

  return result;
};
