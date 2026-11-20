import { getNavigationMenuItemPlacementScopeId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPlacementScopeId';
import { isSameNavigationMenuItemTarget } from '@/navigation-menu-item/common/utils/isSameNavigationMenuItemTarget';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemTargetInPlacementScope = ({
  item,
  items,
}: {
  item: NavigationMenuItem;
  items: NavigationMenuItem[];
}) => {
  const scopeId = getNavigationMenuItemPlacementScopeId({
    parentId: item.parentId,
    items,
  });

  return items.some(
    (candidate) =>
      candidate.id !== item.id &&
      getNavigationMenuItemPlacementScopeId({
        parentId: candidate.parentId,
        items,
      }) === scopeId &&
      isSameNavigationMenuItemTarget({
        firstItem: item,
        secondItem: candidate,
      }),
  );
};
