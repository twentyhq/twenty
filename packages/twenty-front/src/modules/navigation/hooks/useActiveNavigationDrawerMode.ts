import { useLocation } from 'react-router-dom';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';

// Settings, the AI chat and the inbox own a full page each, so the route
// decides those modes. The stored tab only has the final say when none of them
// is open, which is what keeps the chat history or the inbox listed while the
// user works elsewhere.
export const useActiveNavigationDrawerMode = (): NavigationDrawerActiveTab => {
  const { pathname } = useLocation();
  const isSettingsDrawer = useIsSettingsDrawer();
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );

  if (isSettingsDrawer) {
    return NAVIGATION_DRAWER_TABS.SETTINGS;
  }

  if (isAiChatPath(pathname)) {
    return NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  }

  if (isInboxPath(pathname)) {
    return NAVIGATION_DRAWER_TABS.INBOX;
  }

  if (
    navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY ||
    navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.INBOX
  ) {
    return navigationDrawerActiveTab;
  }

  return NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
};
