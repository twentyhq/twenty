import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportChat } from '@/support/components/SupportChat';
import { GithubVersionLink } from '@/ui/navigation/link/components/GithubVersionLink';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';

import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

import { MainNavigationDrawerItems } from './MainNavigationDrawerItems';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useRecoilValue(
    currentMobileNavigationDrawerState,
  );
  const setIsNavigationDrawerOpen = useSetRecoilState(
    isNavigationDrawerOpenState,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const isSettingsDrawer = isMobile
    ? currentMobileNavigationDrawer === 'settings'
    : isSettingsPage;

  const drawerProps: NavigationDrawerProps = isSettingsDrawer
    ? {
        isSubMenu: true,
        title: 'Settings',
        children: <SettingsNavigationDrawerItems />,
        footer: <GithubVersionLink />,
      }
    : {
        logo:
          (currentWorkspace?.logo &&
            getImageAbsoluteURIOrBase64(currentWorkspace.logo)) ??
          undefined,
        title: currentWorkspace?.displayName ?? undefined,
        children: <MainNavigationDrawerItems />,
        footer: <SupportChat />,
      };

  useEffect(() => {
    setIsNavigationDrawerOpen(!isMobile);
  }, [isMobile, setIsNavigationDrawerOpen]);

  return (
    <NavigationDrawer
      className={className}
      isSubMenu={drawerProps.isSubMenu}
      logo={drawerProps.logo}
      title={drawerProps.title}
      footer={drawerProps.footer}
    >
      {drawerProps.children}
    </NavigationDrawer>
  );
};
