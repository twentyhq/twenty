import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import {
  NAVIGATION_DRAWER_TABS,
  type NavigationDrawerActiveTab,
} from '@/ui/navigation/states/navigationDrawerTabs';

export const getActiveNavigationMenuTab = ({
  tabs,
  currentNavigationMenuTabId,
  activeNavigationDrawerTab,
  isLayoutCustomizationModeEnabled,
}: {
  tabs: NamedNavigationMenuItem[];
  currentNavigationMenuTabId: string | null;
  activeNavigationDrawerTab: NavigationDrawerActiveTab;
  isLayoutCustomizationModeEnabled: boolean;
}): NamedNavigationMenuItem | null => {
  if (
    activeNavigationDrawerTab !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU ||
    isLayoutCustomizationModeEnabled
  ) {
    return null;
  }

  return tabs.find((tab) => tab.id === currentNavigationMenuTabId) ?? null;
};
