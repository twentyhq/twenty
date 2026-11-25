import { useLocation } from 'react-router-dom';

import { useHasAiChatSectionInSidebar } from '@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

// Settings, AI chat and inbox pages decide their mode; elsewhere the stored tab wins so chat history stays listed.
export const useActiveNavigationDrawerTab = (): NavigationDrawerActiveTab => {
  const { pathname } = useLocation();
  const isSettingsDrawer = useIsSettingsDrawer();
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );
  const hasAiChatSectionInSidebar = useHasAiChatSectionInSidebar();

  if (isSettingsDrawer) {
    return NAVIGATION_DRAWER_TABS.SETTINGS;
  }

  if (
    !hasAiChatSectionInSidebar &&
    (isAiModePath(pathname) ||
      navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)
  ) {
    return NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  }

  return NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
};
