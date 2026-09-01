import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useToggleNavigationDrawer = () => {
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const toggleNavigationDrawer = () => {
    if (isNavigationDrawerExpanded) {
      setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    }
    setIsNavigationDrawerExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  return { isNavigationDrawerExpanded, toggleNavigationDrawer };
};
