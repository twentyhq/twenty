import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useRecoilValue } from 'recoil';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useIsSettingsDrawer = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useRecoilValue(
    currentMobileNavigationDrawerState,
  );
  return isMobile
    ? currentMobileNavigationDrawer === 'settings'
    : isSettingsPage;
};
