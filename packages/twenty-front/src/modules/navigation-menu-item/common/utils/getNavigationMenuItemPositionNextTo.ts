import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { computeDndReorderPosition } from '@/navigation-menu-item/common/utils/computeDndReorderPosition';

export const getNavigationMenuItemPositionNextTo = ({
  sortedSiblings,
  navigationMenuItemId,
  targetNavigationMenuItemId,
}: {
  sortedSiblings: Pick<NavigationMenuItem, 'id' | 'position'>[];
  navigationMenuItemId: string;
  targetNavigationMenuItemId: string;
}): number | null => {
  const sourceIndex = sortedSiblings.findIndex(
    (sibling) => sibling.id === navigationMenuItemId,
  );
  const targetIndex = sortedSiblings.findIndex(
    (sibling) => sibling.id === targetNavigationMenuItemId,
  );

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return null;
  }

  return computeDndReorderPosition({
    sortedList: sortedSiblings,
    draggableId: navigationMenuItemId,
    destinationIndex: sourceIndex < targetIndex ? targetIndex + 1 : targetIndex,
  });
};
