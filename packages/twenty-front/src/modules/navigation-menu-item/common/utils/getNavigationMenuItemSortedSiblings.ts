import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION } from '@/navigation-menu-item/common/constants/NavigationMenuContainerItemsSectionPosition';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';

const CONTAINER_ITEMS_SIBLING_ID = 'container-items';

export const getNavigationMenuItemSortedSiblings = ({
  items,
  navigationMenuItem,
  visibleItemIds,
}: {
  items: NavigationMenuItem[];
  navigationMenuItem: NavigationMenuItem;
  visibleItemIds: Set<string>;
}): Pick<NavigationMenuItem, 'id' | 'position'>[] => {
  const folderId = navigationMenuItem.folderId ?? null;
  const isContainer = isNavigationMenuItemContainer(navigationMenuItem);
  const isSection = isNavigationMenuItemAnySection(navigationMenuItem);
  const isSameKind = (item: NavigationMenuItem) =>
    isSection
      ? isNavigationMenuItemAnySection(item)
      : item.type === navigationMenuItem.type;
  const siblings: Pick<NavigationMenuItem, 'id' | 'position'>[] = items.filter(
    (item) =>
      (item.folderId ?? null) === folderId &&
      (isContainer ? isSameKind(item) : visibleItemIds.has(item.id)),
  );

  return (
    isSection
      ? [
          ...siblings,
          {
            id: CONTAINER_ITEMS_SIBLING_ID,
            position: NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION,
          },
        ]
      : siblings
  ).sort((a, b) => a.position - b.position);
};
