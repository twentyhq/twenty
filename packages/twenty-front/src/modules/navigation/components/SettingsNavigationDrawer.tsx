import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { AdvancedSettingsToggle } from 'twenty-ui/navigation';
import { useGetVersionInfoQuery } from '~/generated-metadata/graphql';

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t: tLingui } = useLingui();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );
  const { data, loading } = useGetVersionInfoQuery();

  return (
    <NavigationDrawer className={className} title={tLingui`Exit Settings`}>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <NavigationDrawerFixedContent>
        <AdvancedSettingsToggle
          isAdvancedModeEnabled={isAdvancedModeEnabled}
          setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
          label={tLingui`Advanced:`}
        />
        <SettingsAdminVersionDisplay
          version={data?.versionInfo?.currentVersion}
          loading={loading}
          noVersionMessage={t`Unknown`}
        />
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
