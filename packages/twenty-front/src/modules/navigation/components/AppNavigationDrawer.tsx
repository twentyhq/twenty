import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { AdvancedSettingsToggle } from '@/ui/navigation/link/components/AdvancedSettingsToggle';
import { MainNavigationDrawerItems } from './MainNavigationDrawerItems';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const drawerProps: NavigationDrawerProps = isSettingsDrawer
    ? {
        title: 'Exit Settings',
        children: <SettingsNavigationDrawerItems />,
        footer: <AdvancedSettingsToggle />,
      }
    : {
        logo:
          (currentWorkspace?.logo &&
            getImageAbsoluteURI(currentWorkspace.logo)) ??
          undefined,
        title: currentWorkspace?.displayName ?? undefined,
        children: <MainNavigationDrawerItems />,
        footer: <SupportDropdown />,
      };

  return (
    <NavigationDrawer
      className={className}
      logo={drawerProps.logo}
      title={drawerProps.title}
      footer={drawerProps.footer}
    >
      {drawerProps.children}
    </NavigationDrawer>
  );
};
