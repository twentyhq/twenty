import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useLingui } from '@lingui/react/macro';
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
