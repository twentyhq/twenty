import { SettingsAppPreferencesAppNameCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppNameCell';
import { SettingsAppPreferencesAppStatusCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppStatusCell';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { type AppPreferencesApp } from '@/settings/app-preferences/types/AppPreferencesApp';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const apps: AppPreferencesApp[] = [
    ...enabledNativeAccountApps.map(
      (nativeAccountApp): AppPreferencesApp => ({
        type: 'native',
        id: nativeAccountApp.id,
        nativeAccountApp,
      }),
    ),
    ...applicationsWithPreferences.map(
      (applicationWithPreferences): AppPreferencesApp => ({
        type: 'installed',
        id: applicationWithPreferences.application.id,
        applicationWithPreferences,
      }),
    ),
  ];

  return (
    <SettingsTableListSection<AppPreferencesApp>
      title={t`App preferences`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      items={apps}
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
      onRowClick={(app) =>
        app.type === 'native'
          ? navigateSettings(SettingsPath.NativeAccountApp, {
              nativeAccountAppId: app.nativeAccountApp.id,
            })
          : navigateSettings(SettingsPath.ApplicationPreferences, {
              applicationId: app.applicationWithPreferences.application.id,
            })
      }
    />
  );
};
