import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';

type GetHomeNavigationMenuItemsInDisplayOrderArgs = Omit<
  Parameters<typeof getWorkspaceSidebarOrphanItemsInDisplayOrder>[0],
  | 'containerId'
  | 'includeInaccessibleObjectBackedItems'
  | 'shouldIncludeTopLevelItems'
> & {
  workspaceNavigationMenuItemsByFolder: Parameters<
    typeof flattenNavigationMenuItemsWithFolderChildren
  >[1];
};

export const getHomeNavigationMenuItemsInDisplayOrder = ({
  workspaceNavigationMenuItemsByFolder,
  ...orphanItemsArgs
}: GetHomeNavigationMenuItemsInDisplayOrderArgs): NavigationMenuItem[] => {
  const getContainerItems = (containerId: string | null) =>
    getWorkspaceSidebarOrphanItemsInDisplayOrder({
      ...orphanItemsArgs,
      containerId,
    });

  const homeChildren = sortNavigationMenuContainerChildren({
    items: getContainerItems(null),
    sections: getNavigationMenuContainersInDisplayOrder({
      navigationMenuItems: orphanItemsArgs.workspaceNavigationMenuItems,
      type: NavigationMenuItemType.SECTION,
      containerId: null,
    }),
  });

  return flattenNavigationMenuItemsWithFolderChildren(
    homeChildren.flatMap((child) =>
      child.type === NavigationMenuItemType.SECTION
        ? getContainerItems(child.id)
        : [child],
    ),
    workspaceNavigationMenuItemsByFolder,
  );
};
