import { getPositionBetween } from '@/navigation-menu-item/common/utils/getPositionBetween';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemMovedPosition = ({
  siblings,
  itemId,
  offset,
}: {
  siblings: Pick<NavigationMenuItem, 'id' | 'position'>[];
  itemId: string;
  offset: -1 | 1;
}): number | null => {
  const index = siblings.findIndex((sibling) => sibling.id === itemId);
  const targetIndex = index + offset;

  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
    return null;
  }

  const [before, after] =
    offset === -1
      ? [siblings[targetIndex - 1], siblings[targetIndex]]
      : [siblings[targetIndex], siblings[targetIndex + 1]];

  return getPositionBetween(before?.position, after?.position);
};
