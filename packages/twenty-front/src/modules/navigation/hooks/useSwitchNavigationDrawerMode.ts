import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { getExpandedAiChatReturnLocation } from '@/ai/utils/getExpandedAiChatReturnLocation';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { getNavigationDrawerHomeDestination } from '@/navigation/utils/getNavigationDrawerHomeDestination';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const useSwitchNavigationDrawerMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateSettings = useNavigateSettings();

  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isAiChatPage = isAiChatPath(location.pathname);

  const navigationMemorizedUrl = useAtomStateValue(navigationMemorizedUrlState);
  const navigationDrawerExpandedMemorized = useAtomStateValue(
    navigationDrawerExpandedMemorizedState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });
  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: false,
    destinationPath: getNavigationDrawerHomeDestination({
      memorizedUrl: getExpandedAiChatReturnLocation(location.state),
      defaultHomePagePath,
    }),
  });

  const switchToNavigationMenu = () => {
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);

    if (isSettingsDrawer) {
      setCurrentMobileNavigationDrawer('main');
      setIsNavigationDrawerExpanded(navigationDrawerExpandedMemorized);
      navigate(
        getNavigationDrawerHomeDestination({
          memorizedUrl: navigationMemorizedUrl,
          defaultHomePagePath,
        }),
        { replace: true },
      );
      return;
    }

    if (isAiChatPage) {
      returnFromExpandedAiChat();
    }
  };

  const switchToAiChat = () => {
    setCurrentMobileNavigationDrawer('main');
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
    switchToNewChat();
  };

  // The AI mode also covers the chat history listed next to another page, so it
  // is the chat page rather than the active mode that makes a click a no-op.
  const switchNavigationDrawerMode = (mode: NavigationDrawerActiveTab) => {
    switch (mode) {
      case NAVIGATION_DRAWER_TABS.NAVIGATION_MENU:
        if (
          activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
        ) {
          return;
        }
        switchToNavigationMenu();
        break;
      case NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY:
        if (isAiChatPage) {
          return;
        }
        switchToAiChat();
        break;
      case NAVIGATION_DRAWER_TABS.SETTINGS:
        if (isSettingsDrawer) {
          return;
        }
        navigateSettings(SettingsPath.ProfilePage);
        break;
    }
  };

  return { switchNavigationDrawerMode };
};
