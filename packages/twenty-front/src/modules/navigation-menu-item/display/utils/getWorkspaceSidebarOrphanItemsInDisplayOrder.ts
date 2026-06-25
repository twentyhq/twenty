import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';

type GetWorkspaceSidebarOrphanItemsInDisplayOrderArgs = {
  workspaceNavigationMenuItems: NavigationMenuItem[];
  workspaceNavigationMenuItemsSorted: NavigationMenuItem[];
  includeInaccessibleObjectBackedItems?: boolean;
};

export const getWorkspaceSidebarOrphanItemsInDisplayOrder = ({
  workspaceNavigationMenuItems,
  workspaceNavigationMenuItemsSorted,
  includeInaccessibleObjectBackedItems = false,
}: GetWorkspaceSidebarOrphanItemsInDisplayOrderArgs): NavigationMenuItem[] => {
  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter((item) => !isDefined(item.folderId))
    .sort((a, b) => a.position - b.position);

  const processedItemsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  return flatWorkspaceItems.reduce<NavigationMenuItem[]>((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      acc.push({
        ...item,
        icon: item.icon ?? FOLDER_ICON_DEFAULT,
      });
      return acc;
    }

    const processedItem = processedItemsById.get(item.id);
    if (!isDefined(processedItem) && !includeInaccessibleObjectBackedItems) {
      return acc;
    }

    acc.push(isDefined(processedItem) ? processedItem : item);
    return acc;
  }, []);
};
