import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useLingui } from '@lingui/react/macro';
import { AdvancedSettingsToggle } from 'twenty-ui/navigation';

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useLingui();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilStateV2(
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
