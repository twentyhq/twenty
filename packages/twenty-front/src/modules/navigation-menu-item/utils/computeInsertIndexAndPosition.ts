import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const computeInsertIndexAndPosition = (
  currentDraft: NavigationMenuItem[],
  targetFolderId: string | null,
  targetIndex: number,
) => {
  const itemsInFolder = currentDraft.filter(
    (item) =>
      (item.folderId ?? null) === targetFolderId &&
      !isDefined(item.userWorkspaceId),
  );
  const insertRef = itemsInFolder[targetIndex];
  const lastInFolder = itemsInFolder[itemsInFolder.length - 1];
  const flatIndex = insertRef
    ? currentDraft.indexOf(insertRef)
    : lastInFolder
      ? currentDraft.indexOf(lastInFolder) + 1
      : currentDraft.length;
  const prevPosition = itemsInFolder[targetIndex - 1]?.position ?? 0;
  const nextPosition = itemsInFolder[targetIndex]?.position ?? prevPosition + 1;
  const position = (prevPosition + nextPosition) / 2;
  return { flatIndex, position };
};
