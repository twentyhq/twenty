import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

// The tab is shared with the desktop drawer and persists, so it can still hold
// a tab whose permission has since been revoked.
export const getMobileHomeActiveTab = ({
  navigationDrawerActiveTab,
  hasAiPermission,
}: {
  navigationDrawerActiveTab: NavigationDrawerActiveTab;
  hasAiPermission: boolean;
}): NavigationDrawerActiveTab =>
  navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
  !hasAiPermission
    ? NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
    : navigationDrawerActiveTab;
