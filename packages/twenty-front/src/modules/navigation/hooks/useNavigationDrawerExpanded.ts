import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationDrawerExpanded = () => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  return isSettingsDrawer || isNavigationDrawerExpanded;
};
