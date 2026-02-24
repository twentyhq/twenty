import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useIsSettingsDrawer = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useAtomValue(
    currentMobileNavigationDrawerState,
  );
  return isMobile
    ? currentMobileNavigationDrawer === 'settings'
    : isSettingsPage;
};
