import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { useLingui } from '@lingui/react/macro';
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

  const { t } = useLingui();

  const drawerBaseProps: NavigationDrawerProps = isSettingsDrawer
    ? {
        title: t`Exit Settings`,
        fixedBottomItems: (
          <AdvancedSettingsToggle
            isAdvancedModeEnabled={isAdvancedModeEnabled}
            setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
            label={t`Advanced:`}
          />
        ),
        scrollableItems: <SettingsNavigationDrawerItems />,
      }
    : {
        title: currentWorkspace?.displayName ?? '',
        fixedTopItems: <MainNavigationDrawerFixedItems />,
        scrollableItems: <MainNavigationDrawerScrollableItems />,
        fixedBottomItems: <SupportDropdown />,
      };

  return (
    <NavigationDrawer
      className={className}
      title={drawerBaseProps.title}
      fixedTopItems={drawerBaseProps.fixedTopItems}
      scrollableItems={drawerBaseProps.scrollableItems}
      fixedBottomItems={drawerBaseProps.fixedBottomItems}
    />
  );
};
