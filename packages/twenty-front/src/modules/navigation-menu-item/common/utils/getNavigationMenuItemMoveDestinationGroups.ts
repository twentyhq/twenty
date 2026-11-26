import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItemMoveDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestination';
import { type NavigationMenuItemMoveDestinationGroup } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestinationGroup';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemMoveDestinationGroups = ({
  items,
  tabIds,
  canMoveIntoFolder,
}: {
  items: NavigationMenuItem[];
  tabIds: string[];
  canMoveIntoFolder: boolean;
}): NavigationMenuItemMoveDestinationGroup[] => {
  const getFolderDestinations = (
    parentId: string | null,
  ): NavigationMenuItemMoveDestination[] => {
    if (!canMoveIntoFolder) {
      return [];
    }

    return items
      .filter(
        (item) =>
          isNavigationMenuItemFolder(item) &&
          (item.parentId ?? null) === parentId,
      )
      .sort((a, b) => a.position - b.position)
      .map((folder) => ({
        kind: 'folder',
        containerId: folder.id,
        item: folder,
      }));
  };

  return [null, ...tabIds].map(
    (tabId): NavigationMenuItemMoveDestinationGroup => ({
      tabId,
      destinations: [
        { kind: 'root', containerId: tabId },
        ...getFolderDestinations(tabId),
        ...getNavigationMenuContainersInDisplayOrder({
          navigationMenuItems: items,
          type: NavigationMenuItemType.SECTION,
          containerId: tabId,
        })
          .filter((section) => !isNavigationMenuItemBuiltInSection(section))
          .flatMap((section): NavigationMenuItemMoveDestination[] => [
            { kind: 'section', containerId: section.id, item: section },
            ...getFolderDestinations(section.id),
          ]),
      ],
    }),
  );
};
