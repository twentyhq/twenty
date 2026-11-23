import { getNavigationMenuItemsInPlacementScope } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsInPlacementScope';
import { isSameNavigationMenuItemTarget } from '@/navigation-menu-item/common/utils/isSameNavigationMenuItemTarget';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemTargetInPlacementScope = ({
  item,
  items,
}: {
  item: NavigationMenuItem;
  items: NavigationMenuItem[];
}) =>
  getNavigationMenuItemsInPlacementScope({
    parentId: item.parentId,
    items,
  }).some(
    (candidate) =>
      candidate.id !== item.id &&
      isSameNavigationMenuItemTarget({
        firstItem: item,
        secondItem: candidate,
      }),
  );
