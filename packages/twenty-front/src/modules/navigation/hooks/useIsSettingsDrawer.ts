import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useIsSettingsDrawer = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useRecoilValueV2(
    currentMobileNavigationDrawerState,
  );
  return isMobile
    ? currentMobileNavigationDrawer === 'settings'
    : isSettingsPage;
};
