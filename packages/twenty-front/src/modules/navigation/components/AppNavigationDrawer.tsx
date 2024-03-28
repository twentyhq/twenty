import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  GithubVersionLink,
  isNavigationDrawerOpenState,
  NavigationDrawer,
  NavigationDrawerProps,
  useIsMobile,
} from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportChat } from '@/support/components/SupportChat';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

import packageJson from '../../../../package.json';
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
        footer: <GithubVersionLink version={packageJson.version} />,
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
