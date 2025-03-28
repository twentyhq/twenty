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

import { MainNavigationDrawerItems } from '@/navigation/components/MainNavigationDrawerItems';
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

  const {
    fixedTopItems: mainFixedTopItems,
    scrollableItems: mainScrollableItems,
  } = MainNavigationDrawerItems();

  const { scrollableItems: settingsScrollableItems } =
    SettingsNavigationDrawerItems();

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
        scrollableItems: settingsScrollableItems,
      }
    : {
        title: currentWorkspace?.displayName ?? '',
        fixedTopItems: mainFixedTopItems,
        scrollableItems: mainScrollableItems,
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
