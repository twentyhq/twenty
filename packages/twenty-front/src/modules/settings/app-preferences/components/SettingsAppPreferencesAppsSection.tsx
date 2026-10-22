import { SettingsAppPreferencesAppNameCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppNameCell';
import { SettingsAppPreferencesAppStatusCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppStatusCell';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const { applicationsWithPreferences, hasApplicationsLoadError, refetch } =
    useApplicationsWithPreferences();

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
      title={t`App preferences`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      toolbar={
        hasApplicationsLoadError ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`Your installed apps could not be loaded. Check your connection and try again.`}
              onRetry={() => refetch().catch(() => undefined)}
            />
          </StyledToolbar>
        ) : undefined
      }
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
