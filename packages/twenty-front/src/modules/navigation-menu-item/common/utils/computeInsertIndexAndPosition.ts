import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const computeInsertIndexAndPosition = (
  items: NavigationMenuItem[],
  targetFolderId: string | null,
  targetIndex: number,
) => {
  const itemsInFolder = items
    .filter((item) => (item.folderId ?? null) === targetFolderId)
    .sort((a, b) => a.position - b.position);
  const insertRef = itemsInFolder[targetIndex];
  const lastInFolder = itemsInFolder[itemsInFolder.length - 1];
  const flatIndex = isDefined(insertRef)
    ? items.indexOf(insertRef)
    : isDefined(lastInFolder)
      ? items.indexOf(lastInFolder) + 1
      : items.length;
  const prevPosition = itemsInFolder[targetIndex - 1]?.position ?? 0;
  const nextPosition = itemsInFolder[targetIndex]?.position ?? prevPosition + 1;
  const position = (prevPosition + nextPosition) / 2;
  return { flatIndex, position };
};
