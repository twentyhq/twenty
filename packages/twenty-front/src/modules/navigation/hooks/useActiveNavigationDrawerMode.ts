import { useLocation } from 'react-router-dom';

import { useNavigationMenuAiChatSections } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatSections';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

// Settings, AI chat and inbox pages decide their mode unless the menu holds the chat sections; elsewhere the stored tab wins so chat history stays listed.
export const useActiveNavigationDrawerMode = (): NavigationDrawerActiveTab => {
  const { pathname } = useLocation();
  const isSettingsDrawer = useIsSettingsDrawer();
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );
  const hasAiChatSections = useNavigationMenuAiChatSections().length > 0;

  if (isSettingsDrawer) {
    return NAVIGATION_DRAWER_TABS.SETTINGS;
  }

  if (
    !hasAiChatSections &&
    (isAiModePath(pathname) ||
      navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)
  ) {
    return NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  }

  return NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
};
