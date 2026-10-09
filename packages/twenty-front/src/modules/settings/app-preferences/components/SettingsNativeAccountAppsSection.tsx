import { SettingsNativeAccountAppNameCell } from '@/settings/app-preferences/components/SettingsNativeAccountAppNameCell';
import { SettingsNativeAccountAppStatusCell } from '@/settings/app-preferences/components/SettingsNativeAccountAppStatusCell';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsNativeAccountAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();

  return (
    <SettingsTableListSection<NativeAccountApp>
      title={t`App preferences`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      items={enabledNativeAccountApps}
      columns={[
        { label: t`App`, Cell: SettingsNativeAccountAppNameCell },
        {
          label: t`Status`,
          align: 'right',
          Cell: SettingsNativeAccountAppStatusCell,
        },
      ]}
      gridAutoColumns="1fr 1fr"
      showRowChevron
      onRowClick={(app) =>
        navigateSettings(SettingsPath.NativeAccountApp, {
          nativeAccountAppId: app.id,
        })
      }
    />
  );
};
