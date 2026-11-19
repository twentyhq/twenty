import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getHiddenWorkspaceNavigationMenuItems = ({
  navigationMenuItems,
  excludedIds,
}: {
  navigationMenuItems: NavigationMenuItem[];
  excludedIds: Set<string>;
}): NavigationMenuItem[] => {
  const workspaceNavigationMenuItems =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);
  const activeIds = new Set(
    filterActiveNavigationMenuItems(workspaceNavigationMenuItems).map(
      ({ id }) => id,
    ),
  );

  return workspaceNavigationMenuItems.filter(
    ({ id }) => !activeIds.has(id) && !excludedIds.has(id),
  );
};
