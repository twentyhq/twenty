import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import {
  NAVIGATION_DRAWER_TABS,
  type NavigationDrawerActiveTab,
} from '@/ui/navigation/states/navigationDrawerTabs';

export const getActiveNavigationMenuTab = ({
  tabs,
  currentNavigationMenuTabId,
  activeNavigationDrawerTab,
  isMobile,
}: {
  tabs: NamedNavigationMenuItem[];
  currentNavigationMenuTabId: string | null;
  activeNavigationDrawerTab: NavigationDrawerActiveTab;
  isMobile: boolean;
}): NamedNavigationMenuItem | null => {
  if (
    activeNavigationDrawerTab !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU ||
    isMobile
  ) {
    return null;
  }

  return tabs.find((tab) => tab.id === currentNavigationMenuTabId) ?? null;
};
