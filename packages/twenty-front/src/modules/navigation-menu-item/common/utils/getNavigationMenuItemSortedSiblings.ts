import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION } from '@/navigation-menu-item/common/constants/NavigationMenuContainerItemsSectionPosition';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';

const CONTAINER_ITEMS_SIBLING = {
  id: 'container-items',
  position: NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION,
};

type SiblingCandidate = Pick<
  NavigationMenuItem,
  'id' | 'folderId' | 'type' | 'position'
>;

const byPosition = (
  first: Pick<NavigationMenuItem, 'position'>,
  second: Pick<NavigationMenuItem, 'position'>,
) => first.position - second.position;

export const getNavigationMenuItemSortedSiblings = ({
  items,
  navigationMenuItem,
  visibleItemIds,
}: {
  items: SiblingCandidate[];
  navigationMenuItem: SiblingCandidate;
  visibleItemIds: Set<string>;
}): Pick<NavigationMenuItem, 'id' | 'position'>[] => {
  const folderId = navigationMenuItem.folderId ?? null;
  const isContainer = isNavigationMenuItemContainer(navigationMenuItem);
  const isSection = isNavigationMenuItemAnySection(navigationMenuItem);
  const isSameKind = (item: SiblingCandidate) =>
    isSection
      ? isNavigationMenuItemAnySection(item)
      : item.type === navigationMenuItem.type;
  const siblings: Pick<NavigationMenuItem, 'id' | 'position'>[] = items.filter(
    (item) =>
      (item.folderId ?? null) === folderId &&
      (isContainer ? isSameKind(item) : visibleItemIds.has(item.id)),
  );

  if (!isSection) {
    return siblings.sort(byPosition);
  }

  return [...siblings, CONTAINER_ITEMS_SIBLING].sort(byPosition);
};
