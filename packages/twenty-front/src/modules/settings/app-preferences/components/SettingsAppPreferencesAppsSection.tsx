import { SettingsAppPreferencesAppNameCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppNameCell';
import { SettingsAppPreferencesAppStatusCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppStatusCell';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const rows: AppPreferencesRow[] = [
    ...enabledNativeAccountApps.map((nativeAccountApp): AppPreferencesRow => ({
      type: 'native',
      id: nativeAccountApp.id,
      nativeAccountApp,
    })),
    ...applicationsWithPreferences.map(
      (applicationWithPreferences): AppPreferencesRow => ({
        type: 'installed',
        id: applicationWithPreferences.application.id,
        applicationWithPreferences,
      }),
    ),
  ];

  return (
    <SettingsTableListSection<AppPreferencesRow>
      title={t`App preferences`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      items={rows}
      columns={[
        { label: t`App`, Cell: SettingsAppPreferencesAppNameCell },
        {
          label: t`Status`,
          align: 'right',
          Cell: SettingsAppPreferencesAppStatusCell,
        },
      ]}
      gridAutoColumns="1fr 1fr"
      showRowChevron
      onRowClick={(row) =>
        row.type === 'native'
          ? navigateSettings(SettingsPath.NativeAccountApp, {
              nativeAccountAppId: row.nativeAccountApp.id,
            })
          : navigateSettings(SettingsPath.ApplicationPreferences, {
              applicationId: row.applicationWithPreferences.application.id,
            })
      }
    />
  );
};
