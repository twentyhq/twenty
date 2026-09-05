import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { isAiChatPath } from '~/utils/isAiChatPath';

type GetMobileNavigationBarModeParams = {
  isSettingsDrawer: boolean;
  pathname: string;
};

// The stored tab keeps the chat history listed beside another page on desktop;
// mobile has no such split, so the route alone says which tab the user is on.
export const getMobileNavigationBarMode = ({
  isSettingsDrawer,
  pathname,
}: GetMobileNavigationBarModeParams): NavigationDrawerActiveTab => {
  if (isSettingsDrawer) {
    return NAVIGATION_DRAWER_TABS.SETTINGS;
  }

  if (isAiChatPath(pathname)) {
    return NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  }

  return NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
};
