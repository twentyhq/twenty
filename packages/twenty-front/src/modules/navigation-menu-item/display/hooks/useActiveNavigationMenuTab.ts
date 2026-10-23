import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useNavigationMenuAiChatTab } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatTab';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActiveNavigationMenuTab = (): NavigationMenuItem | null => {
  const isMobile = useIsMobile();
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const currentNavigationMenuTabId = useAtomStateValue(
    currentNavigationMenuTabIdState,
  );
  const tabs = useWorkspaceNavigationMenuTabs();
  const { aiChatTab } = useNavigationMenuAiChatTab();

  if (isMobile) {
    return null;
  }

  if (activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY) {
    return aiChatTab;
  }

  if (activeNavigationDrawerMode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
    return null;
  }

  return (
    tabs.find(
      (tab) =>
        tab.id === currentNavigationMenuTabId && tab.id !== aiChatTab?.id,
    ) ?? null
  );
};
