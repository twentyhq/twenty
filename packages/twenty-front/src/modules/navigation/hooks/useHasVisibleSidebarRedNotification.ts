import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useNavigationDrawerTabs } from '@/navigation/hooks/useNavigationDrawerTabs';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useHasVisibleSidebarRedNotification = () => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const drawerTabs = useNavigationDrawerTabs();
  const activeNavigationDrawerTab = useActiveNavigationDrawerTab();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const navigationMenuTabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const { getTabChatAttention, unreadOpenThreadCount } =
    useNavigationMenuChatAttention();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (isSettingsDrawer) {
    return false;
  }

  const isHomeTabActive =
    activeNavigationDrawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
    !isDefined(activeNavigationMenuTab);

  const hasHomeTabRedDot =
    getTabChatAttention(null) === 'needs-input' &&
    !(isHomeTabActive && isExpanded);

  const hasSidebarTabRedDot = navigationMenuTabs.some(
    (tab) =>
      getTabChatAttention(tab.id) === 'needs-input' &&
      !(activeNavigationMenuTab?.id === tab.id && isExpanded),
  );

  const hasInboxTabRedBadge =
    isAiChatInboxEnabled &&
    unreadOpenThreadCount > 0 &&
    activeNavigationDrawerTab !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
    drawerTabs.some(
      ({ tab }) => tab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );

  return hasHomeTabRedDot || hasSidebarTabRedDot || hasInboxTabRedBadge;
};
