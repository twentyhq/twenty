import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetRecoilState } from 'recoil';

export const useOpenSettingsMenu = () => {
  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );
  const setCurrentMobileNavigationDrawer = useSetRecoilState(
    currentMobileNavigationDrawerState,
  );

  const openSettingsMenu = () => {
    setIsNavigationDrawerExpanded(true);
    setCurrentMobileNavigationDrawer('settings');
  };

  return { openSettingsMenu };
};
