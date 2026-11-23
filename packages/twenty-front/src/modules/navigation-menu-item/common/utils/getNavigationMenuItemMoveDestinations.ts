import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItemMoveDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestination';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemMoveDestinations = ({
  items,
  tabIds,
}: {
  items: NavigationMenuItem[];
  tabIds: string[];
}): NavigationMenuItemMoveDestination[] => {
  const getFolderDestinations = ({
    parentId,
    tabId,
  }: {
    parentId: string | null;
    tabId: string | null;
  }): NavigationMenuItemMoveDestination[] =>
    items
      .filter(
        (item) =>
          isNavigationMenuItemFolder(item) &&
          (item.parentId ?? null) === parentId,
      )
      .sort((a, b) => a.position - b.position)
      .map((folder) => ({
        kind: 'folder',
        containerId: folder.id,
        tabId,
        item: folder,
      }));

  return [null, ...tabIds].flatMap(
    (tabId): NavigationMenuItemMoveDestination[] => [
      { kind: 'root', containerId: tabId, tabId },
      ...getFolderDestinations({ parentId: tabId, tabId }),
      ...getNavigationMenuContainersInDisplayOrder({
        navigationMenuItems: items,
        type: NavigationMenuItemType.SECTION,
        containerId: tabId,
      })
        .filter((section) => !isNavigationMenuItemBuiltInSection(section))
        .flatMap((section): NavigationMenuItemMoveDestination[] => [
          {
            kind: 'section',
            containerId: section.id,
            tabId,
            item: section,
          },
          ...getFolderDestinations({ parentId: section.id, tabId }),
        ]),
    ],
  );
};
