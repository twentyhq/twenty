import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getNavigationMenuItemTabId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTabId';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getHiddenWorkspaceNavigationMenuItems = ({
  navigationMenuItems,
  excludedIds,
  tabId,
}: {
  navigationMenuItems: NavigationMenuItem[];
  excludedIds: Set<string>;
  tabId: string | null;
}): NavigationMenuItem[] => {
  const workspaceNavigationMenuItems =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);
  const activeIds = new Set(
    filterActiveNavigationMenuItems(workspaceNavigationMenuItems).map(
      ({ id }) => id,
    ),
  );

  return workspaceNavigationMenuItems.filter(
    ({ id, parentId }) =>
      !activeIds.has(id) &&
      !excludedIds.has(id) &&
      getNavigationMenuItemTabId({
        parentId,
        items: workspaceNavigationMenuItems,
      }) === tabId,
  );
};
