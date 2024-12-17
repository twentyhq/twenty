import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { getImageAbsoluteURI } from 'twenty-shared';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawerItems } from '@/navigation/components/MainNavigationDrawerItems';
import { isNonEmptyString } from '@sniptt/guards';
import { AdvancedSettingsToggle } from 'twenty-ui';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );

  const drawerProps: NavigationDrawerProps = isSettingsDrawer
    ? {
        title: 'Exit Settings',
        children: <SettingsNavigationDrawerItems />,
        footer: (
          <AdvancedSettingsToggle
            isAdvancedModeEnabled={isAdvancedModeEnabled}
            setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
          />
        ),
      }
    : {
        logo: isNonEmptyString(currentWorkspace?.logo)
          ? getImageAbsoluteURI({
              imageUrl: currentWorkspace.logo,
              baseUrl: REACT_APP_SERVER_BASE_URL,
            })
          : undefined,
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
