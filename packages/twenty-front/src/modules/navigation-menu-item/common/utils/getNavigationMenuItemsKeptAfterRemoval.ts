import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemsKeptAfterRemoval = ({
  navigationMenuItemsBeforeRemoval,
  removedNavigationMenuItems,
}: {
  navigationMenuItemsBeforeRemoval: NavigationMenuItem[];
  removedNavigationMenuItems: NavigationMenuItem[];
}): NavigationMenuItem[] => {
  const hiddenNavigationMenuItems = removedNavigationMenuItems.filter(
    (navigationMenuItem) => navigationMenuItem.isActive === false,
  );
  const hiddenIds = new Set(hiddenNavigationMenuItems.map(({ id }) => id));
  const keptDescendantIds = new Set(
    hiddenNavigationMenuItems.flatMap(({ id }) =>
      getNavigationMenuItemDescendantIds({
        items: navigationMenuItemsBeforeRemoval,
        ancestorId: id,
      }),
    ),
  );

  return [
    ...hiddenNavigationMenuItems,
    ...navigationMenuItemsBeforeRemoval.filter(
      ({ id }) => keptDescendantIds.has(id) && !hiddenIds.has(id),
    ),
  ];
};
