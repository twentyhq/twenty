import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useVisibleNavigationMenuTabs } from '@/navigation/hooks/useVisibleNavigationMenuTabs';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActiveNavigationMenuTab = (): NavigationMenuItem | null => {
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const currentNavigationMenuTabId = useAtomStateValue(
    currentNavigationMenuTabIdState,
  );
  const tabs = useVisibleNavigationMenuTabs();

  if (activeNavigationDrawerMode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
    return null;
  }

  return tabs.find((tab) => tab.id === currentNavigationMenuTabId) ?? null;
};
