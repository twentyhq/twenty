import { isDefined } from 'twenty-shared/utils';

import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getNavigationMenuItemsInPlacementScope } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsInPlacementScope';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { isSameNavigationMenuItemTarget } from '@/navigation-menu-item/common/utils/isSameNavigationMenuItemTarget';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const canPlaceNavigationMenuItemInContainer = ({
  itemId,
  containerId,
  items,
}: {
  itemId: string;
  containerId: string | null;
  items: NavigationMenuItem[];
}) => {
  const item = items.find((candidate) => candidate.id === itemId);

  if (!isDefined(item)) {
    return false;
  }

  if (isNavigationMenuItemTabOrSection(item)) {
    return true;
  }

  const itemsInTargetScope = getNavigationMenuItemsInPlacementScope({
    parentId: containerId,
    items,
  });

  if (itemsInTargetScope.some((candidate) => candidate.id === itemId)) {
    return true;
  }

  const movedIds = new Set([
    itemId,
    ...getNavigationMenuItemDescendantIds({ items, ancestorId: itemId }),
  ]);
  const movedItems = items.filter(({ id }) => movedIds.has(id));
  const otherItemsInTargetScope = itemsInTargetScope.filter(
    (candidate) => !movedIds.has(candidate.id),
  );

  return !movedItems.some((movedItem) =>
    otherItemsInTargetScope.some((candidate) =>
      isSameNavigationMenuItemTarget({
        firstItem: movedItem,
        secondItem: candidate,
      }),
    ),
  );
};
