import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { flattenNavigationMenuItemsWithFolderChildren } from '@/navigation-menu-item/common/utils/flattenNavigationMenuItemsWithFolderChildren';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
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
  const homeSectionIds = getNavigationMenuContainersInDisplayOrder({
    navigationMenuItems: orphanItemsArgs.workspaceNavigationMenuItems,
    type: NavigationMenuItemType.SECTION,
    containerId: null,
  }).map((section) => section.id);

  return [null, ...homeSectionIds].flatMap((containerId) =>
    flattenNavigationMenuItemsWithFolderChildren(
      getWorkspaceSidebarOrphanItemsInDisplayOrder({
        ...orphanItemsArgs,
        containerId,
      }),
      workspaceNavigationMenuItemsByFolder,
    ),
  );
};
