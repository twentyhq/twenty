import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { AdvancedSettingsToggle } from 'twenty-ui/navigation';

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useLingui();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useAtomState(
    isAdvancedModeEnabledState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  // Force expand navigation drawer in Settings to prevent collapsed state from main app
  useEffect(() => {
    setIsNavigationDrawerExpanded(true);
  }, [setIsNavigationDrawerExpanded]);

  return (
    <NavigationDrawer className={className} title={t`Exit Settings`}>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <NavigationDrawerFixedContent>
        <AdvancedSettingsToggle
          isAdvancedModeEnabled={isAdvancedModeEnabled}
          setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
          label={t`Advanced:`}
        />
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
