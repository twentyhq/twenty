import { useStore } from 'jotai';

import { isInboxSplitViewOpenState } from '@/inbox/states/isInboxSplitViewOpenState';
import { wasNavigationDrawerExpandedBeforeInboxPanelState } from '@/inbox/states/wasNavigationDrawerExpandedBeforeInboxPanelState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useToggleNavigationDrawer = () => {
  const store = useStore();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const { closeSidePanelMenu } = useSidePanelMenu();

  const toggleNavigationDrawer = () => {
    if (isNavigationDrawerExpanded) {
      setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    }

    // The inbox split view and a side panel do not fit beside an open drawer,
    // so bringing the drawer back sends the panel away.
    if (
      !isNavigationDrawerExpanded &&
      store.get(isInboxSplitViewOpenState.atom) &&
      store.get(isSidePanelOpenedState.atom)
    ) {
      store.set(wasNavigationDrawerExpandedBeforeInboxPanelState.atom, false);
      void closeSidePanelMenu();
    }

    setIsNavigationDrawerExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  return { isNavigationDrawerExpanded, toggleNavigationDrawer };
};
