import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/common/utils/getHiddenNavigationMenuItemsInTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHiddenNavigationMenuItemsInTab = (tabId: string | null) => {
  const navigationMenuItemsWithHidden = useAtomStateValue(
    navigationMenuItemsWithHiddenSelector,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  return getHiddenNavigationMenuItemsInTab({
    navigationMenuItems: filterWorkspaceNavigationMenuItems(
      navigationMenuItemsWithHidden,
    ),
    excludedIds: new Set(workspaceNavigationMenuItems.map(({ id }) => id)),
    tabId,
  });
};
