import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawer } from '@/navigation/components/MainNavigationDrawer';
import { SettingsNavigationDrawer } from '@/navigation/components/SettingsNavigationDrawer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();

  if (isSettingsDrawer) {
    return <SettingsNavigationDrawer className={className} />;
  }

  // The main navigation is the home page on mobile, not a drawer.
  if (isMobile) {
    return null;
  }

  return <MainNavigationDrawer className={className} />;
};
