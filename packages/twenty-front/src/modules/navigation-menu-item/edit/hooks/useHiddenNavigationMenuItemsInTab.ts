import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/common/utils/getHiddenNavigationMenuItemsInTab';
import { getNavigationMenuItemPlacementScopeId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPlacementScopeId';
import { isSameNavigationMenuItemTarget } from '@/navigation-menu-item/common/utils/isSameNavigationMenuItemTarget';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHiddenNavigationMenuItemsInTab = (tabId: string | null) => {
  const navigationMenuItemsWithHidden = useAtomStateValue(
    navigationMenuItemsWithHiddenSelector,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  const getPlacementScopeId = (parentId: string | null | undefined) =>
    getNavigationMenuItemPlacementScopeId({
      parentId,
      items: workspaceNavigationMenuItems,
    });

  return getHiddenNavigationMenuItemsInTab({
    navigationMenuItems: filterWorkspaceNavigationMenuItems(
      navigationMenuItemsWithHidden,
    ),
    excludedIds: new Set(workspaceNavigationMenuItems.map(({ id }) => id)),
    tabId,
  }).filter(
    (hiddenItem) =>
      !workspaceNavigationMenuItems.some(
        (activeItem) =>
          getPlacementScopeId(activeItem.parentId) ===
            getPlacementScopeId(hiddenItem.parentId) &&
          isSameNavigationMenuItemTarget({
            firstItem: hiddenItem,
            secondItem: activeItem,
          }),
      ),
  );
};
