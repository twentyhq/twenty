import { useStore } from 'jotai';
import { useIsMobile } from 'twenty-ui/utilities';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useReturnFromExpandedAiChat } from '@/ai-chat/hooks/useReturnFromExpandedAiChat';
import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { getExpandedAiChatReturnLocation } from '@/ai-chat/utils/getExpandedAiChatReturnLocation';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuTabIdToOpenFirstItemState } from '@/navigation-menu-item/common/states/navigationMenuTabIdToOpenFirstItemState';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
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
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isAiModePath } from '~/utils/isAiModePath';

export const useSwitchNavigationDrawerTab = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const navigateSettings = useNavigateSettings();

  const activeNavigationDrawerTab = useActiveNavigationDrawerTab();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isSettingsPage = useIsSettingsPage();
  const isAiModePage = isAiModePath(location.pathname);

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
  const store = useStore();
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { switchToNewAiChat } = useSwitchToNewAiChatInInboxChannel({
    shouldOpenInFullPage: true,
  });
  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: false,
    destinationPath: getNavigationDrawerHomeDestination({
      memorizedUrl: getExpandedAiChatReturnLocation(location.state),
      defaultHomePagePath,
    }),
  });

  const leaveSettingsDrawer = () => {
    setCurrentMobileNavigationDrawer('main');
    if (isMobile) {
      setIsNavigationDrawerExpanded(navigationDrawerExpandedMemorized);
    }
  };

  const switchToNavigationMenu = () => {
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);

    if (isSettingsDrawer) {
      leaveSettingsDrawer();
      navigate(
        getNavigationDrawerHomeDestination({
          memorizedUrl: navigationMemorizedUrl,
          defaultHomePagePath,
        }),
        { replace: true },
      );
      return;
    }

    if (isAiModePage) {
      returnFromExpandedAiChat();
    }
  };

  const openNavigationMenuPage = (path: string) => {
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);

    if (isSettingsDrawer) {
      leaveSettingsDrawer();
    }

    navigate(path, { replace: isSettingsDrawer });
  };

  const switchToNavigationMenuTab = (tabId: string | null) => {
    const previousTabId = store.get(currentNavigationMenuTabIdState.atom);
    const shouldOpenTabPage =
      isCustomizableSidebarEnabled &&
      !store.get(isLayoutCustomizationModeEnabledState.atom) &&
      tabId !== previousTabId;

    setCurrentNavigationMenuTabId(tabId);
    store.set(navigationMenuTabIdToOpenFirstItemState.atom, null);

    if (shouldOpenTabPage) {
      if (!isDefined(tabId)) {
        openNavigationMenuPage(defaultHomePagePath);
        return;
      }

      store.set(navigationMenuTabIdToOpenFirstItemState.atom, tabId);
    }

    if (activeNavigationDrawerTab !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
      switchToNavigationMenu();
    }
  };

  const switchToAiChat = () => {
    setCurrentMobileNavigationDrawer('main');
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
    switchToNewAiChat();
  };

  // AI mode also lists chat history beside other pages, so only the chat and inbox pages make a click a no-op.
  const switchNavigationDrawerTab = (mode: NavigationDrawerActiveTab) => {
    switch (mode) {
      case NAVIGATION_DRAWER_TABS.NAVIGATION_MENU:
        switchToNavigationMenuTab(null);
        break;
      case NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY:
        if (isAiModePage) {
          return;
        }
        switchToAiChat();
        break;
      case NAVIGATION_DRAWER_TABS.SETTINGS:
        // The mobile settings drawer can outlive its route (browser back), so check the page, not the drawer.
        if (isSettingsPage) {
          return;
        }
        navigateSettings(SettingsPath.ProfilePage);
        break;
    }
  };

  return { switchNavigationDrawerTab, switchToNavigationMenuTab };
};
