import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawer } from '@/navigation/components/MainNavigationDrawer';
import { SettingsNavigationDrawer } from '@/navigation/components/SettingsNavigationDrawer';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  return isSettingsDrawer ? (
    <SettingsNavigationDrawer className={className} />
  ) : (
    <MainNavigationDrawer className={className} />
  );
};
