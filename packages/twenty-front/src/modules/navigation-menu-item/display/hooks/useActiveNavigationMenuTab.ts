import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { getActiveNavigationMenuTab } from '@/navigation-menu-item/common/utils/getActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActiveNavigationMenuTab = () =>
  getActiveNavigationMenuTab({
    tabs: useWorkspaceNavigationMenuTabs(),
    currentNavigationMenuTabId: useAtomStateValue(
      currentNavigationMenuTabIdState,
    ),
    activeNavigationDrawerMode: useActiveNavigationDrawerMode(),
    isLayoutCustomizationModeEnabled: useAtomStateValue(
      isLayoutCustomizationModeEnabledState,
    ),
  });
