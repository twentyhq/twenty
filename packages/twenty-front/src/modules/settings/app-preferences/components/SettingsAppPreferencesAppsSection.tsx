import { SettingsAppPreferencesAppNameCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppNameCell';
import { SettingsAppPreferencesAppStatusCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppStatusCell';
import { SettingsAppPreferencesAppsSectionToolbar } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsSectionToolbar';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const {
    applicationsWithPreferences,
    loading,
    hasLoadedApplicationsWithPreferences,
    hasApplicationsLoadError,
    refetch,
  } = useApplicationsWithPreferences();
  const isLoadingApplications =
    loading && !hasLoadedApplicationsWithPreferences;

  const rows: AppPreferencesRow[] = [
    ...enabledBuiltInAccountApps.map(
      (builtInAccountApp): AppPreferencesRow => ({
        type: 'builtIn',
        id: builtInAccountApp.id,
        builtInAccountApp,
      }),
    ),
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
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      toolbar={
        <SettingsAppPreferencesAppsSectionToolbar
          isLoading={isLoadingApplications}
          hasLoadError={hasApplicationsLoadError}
          onRetry={() => refetch().catch(() => undefined)}
        />
      }
      items={isLoadingApplications ? [] : rows}
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
        row.type === 'builtIn'
          ? navigateSettings(SettingsPath.BuiltInAccountApp, {
              builtInAccountAppId: row.builtInAccountApp.id,
            })
          : navigateSettings(SettingsPath.ApplicationPreferences, {
              applicationId: row.applicationWithPreferences.application.id,
            })
      }
    />
  );
};
