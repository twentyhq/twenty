import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { AdvancedSettingsToggle } from '@/ui/navigation/link/components/AdvancedSettingsToggle';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { MainNavigationDrawerItems } from './MainNavigationDrawerItems';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );
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

  useEffect(() => {
    setIsNavigationDrawerExpanded(!isMobile);
  }, [isMobile, setIsNavigationDrawerExpanded]);

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
