import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useRecoilState } from 'recoil';

export const useOpenSettingsMenu = () => {
  const [, setIsNavigationDrawerExpanded] = useRecoilState(
    isNavigationDrawerExpandedState,
  );
  const [, setCurrentMobileNavigationDrawer] = useRecoilState(
    currentMobileNavigationDrawerState,
  );

  const openSettingsMenu = () => {
    setIsNavigationDrawerExpanded(true);
    setCurrentMobileNavigationDrawer('settings');
  };

  return { openSettingsMenu };
};
