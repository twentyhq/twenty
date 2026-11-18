import { NavigationMenuItemType } from 'twenty-shared/types';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { getActiveNavigationMenuTab } from '@/navigation-menu-item/common/utils/getActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActiveNavigationMenuTab = () =>
  getActiveNavigationMenuTab({
    tabs: useWorkspaceNavigationMenuContainers({
      type: NavigationMenuItemType.TAB,
      containerId: null,
    }),
    currentNavigationMenuTabId: useAtomStateValue(
      currentNavigationMenuTabIdState,
    ),
    activeNavigationDrawerTab: useActiveNavigationDrawerTab(),
  });
