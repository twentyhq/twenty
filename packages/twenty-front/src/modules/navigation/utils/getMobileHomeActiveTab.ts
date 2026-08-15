import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

export type MobileHomeActiveTab =
  | typeof NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
  | typeof NAVIGATION_DRAWER_TABS.SETTINGS;

// The tab is shared with the desktop drawer and persists, so it can hold a tab
// that the mobile home page has no section for.
export const getMobileHomeActiveTab = (
  navigationDrawerActiveTab: NavigationDrawerActiveTab,
): MobileHomeActiveTab =>
  navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.SETTINGS
    ? NAVIGATION_DRAWER_TABS.SETTINGS
    : NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
