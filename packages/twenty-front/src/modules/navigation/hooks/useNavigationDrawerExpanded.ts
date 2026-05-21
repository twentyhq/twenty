import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationDrawerExpanded = () => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  return isMobile
    ? isNavigationDrawerExpanded
    : isSettingsDrawer || isNavigationDrawerExpanded;
};
