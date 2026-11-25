import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

export const isNavigationDrawerTabShown = ({
  tab,
  hasAiPermission,
  hasAiChatSectionInSidebar,
  isCustomizableSidebarEnabled,
}: {
  tab: NavigationDrawerActiveTab;
  hasAiPermission: boolean;
  hasAiChatSectionInSidebar: boolean;
  isCustomizableSidebarEnabled: boolean;
}) => {
  switch (tab) {
    case NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY:
      return hasAiPermission && !hasAiChatSectionInSidebar;
    case NAVIGATION_DRAWER_TABS.SETTINGS:
      return !isCustomizableSidebarEnabled;
    default:
      return true;
  }
};
