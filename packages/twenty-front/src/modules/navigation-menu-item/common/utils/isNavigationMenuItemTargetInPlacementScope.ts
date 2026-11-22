import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';
import { isSameNavigationMenuItemTarget } from '@/navigation-menu-item/common/utils/isSameNavigationMenuItemTarget';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemTargetInPlacementScope = ({
  item,
  items,
}: {
  item: NavigationMenuItem;
  items: NavigationMenuItem[];
}) => {
  const scopeId = getNavigationMenuItemContainerId({ item, items });

  return items.some(
    (candidate) =>
      candidate.id !== item.id &&
      getNavigationMenuItemContainerId({ item: candidate, items }) ===
        scopeId &&
      isSameNavigationMenuItemTarget({
        firstItem: item,
        secondItem: candidate,
      }),
  );
};
