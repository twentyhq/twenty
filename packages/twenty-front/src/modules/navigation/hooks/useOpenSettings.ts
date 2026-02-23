import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useOpenSettingsMenu = () => {
  const setIsNavigationDrawerExpanded = useSetRecoilStateV2(
    isNavigationDrawerExpandedState,
  );
  const setCurrentMobileNavigationDrawer = useSetRecoilStateV2(
    currentMobileNavigationDrawerState,
  );

  const openSettingsMenu = () => {
    setIsNavigationDrawerExpanded(true);
    setCurrentMobileNavigationDrawer('settings');
  };

  return { openSettingsMenu };
};
