import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const computeInsertIndexAndPosition = ({
  items,
  siblings,
  targetIndex,
}: {
  items: NavigationMenuItem[];
  siblings: NavigationMenuItem[];
  targetIndex: number;
}) => {
  const insertRef = siblings[targetIndex];
  const lastSibling = siblings[siblings.length - 1];
  const flatIndex = isDefined(insertRef)
    ? items.indexOf(insertRef)
    : isDefined(lastSibling)
      ? items.indexOf(lastSibling) + 1
      : items.length;
  const prevPosition = siblings[targetIndex - 1]?.position ?? 0;
  const nextPosition = siblings[targetIndex]?.position ?? prevPosition + 1;
  const position = (prevPosition + nextPosition) / 2;
  return { flatIndex, position };
};
