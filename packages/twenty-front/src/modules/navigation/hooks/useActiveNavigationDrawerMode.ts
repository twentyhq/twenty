import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isMatchingPathname } from '~/utils/isMatchingPathname';

// Settings, AI chat and inbox pages decide their mode; elsewhere the stored tab wins so chat history stays listed.
export const useActiveNavigationDrawerMode = (): NavigationDrawerActiveTab => {
  const { pathname } = useLocation();
  const isSettingsDrawer = useIsSettingsDrawer();
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );

  if (isSettingsDrawer) {
    return NAVIGATION_DRAWER_TABS.SETTINGS;
  }

  if (
    isAiChatPath(pathname) ||
    isMatchingPathname(pathname, AppPath.AiChatInbox) ||
    navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
  ) {
    return NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  }

  return NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
};
