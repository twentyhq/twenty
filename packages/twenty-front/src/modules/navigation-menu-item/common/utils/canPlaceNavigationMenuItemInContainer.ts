import { isDefined } from 'twenty-shared/utils';

import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { getNavigationMenuItemPlacementScopeId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPlacementScopeId';
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

  const targetScopeId = getNavigationMenuItemPlacementScopeId({
    parentId: containerId,
    items,
  });

  if (
    targetScopeId ===
    getNavigationMenuItemPlacementScopeId({ parentId: item.parentId, items })
  ) {
    return true;
  }

  const movedIds = new Set([
    itemId,
    ...getNavigationMenuItemDescendantIds({ items, ancestorId: itemId }),
  ]);
  const movedItems = items.filter(({ id }) => movedIds.has(id));
  const itemsInTargetScope = items.filter(
    (candidate) =>
      !movedIds.has(candidate.id) &&
      getNavigationMenuItemPlacementScopeId({
        parentId: candidate.parentId,
        items,
      }) === targetScopeId,
  );

  return !movedItems.some((movedItem) =>
    itemsInTargetScope.some((candidate) =>
      isSameNavigationMenuItemTarget(movedItem, candidate),
    ),
  );
};
