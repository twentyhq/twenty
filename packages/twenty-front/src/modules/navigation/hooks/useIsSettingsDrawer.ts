import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const useIsSettingsDrawer = () => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useAtomStateValue(
    currentMobileNavigationDrawerState,
  );
  return isMobile
    ? currentMobileNavigationDrawer === 'settings'
    : isSettingsPage;
};
