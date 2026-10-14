import { SettingsAppPreferencesAppNameCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppNameCell';
import { SettingsAppPreferencesAppStatusCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAppStatusCell';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { type AppPreferencesApp } from '@/settings/app-preferences/types/AppPreferencesApp';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const {
    applicationsWithPreferences,
    hasLoadedApplicationsWithPreferences,
    error,
    refetch,
  } = useApplicationsWithPreferences();

  const apps: AppPreferencesApp[] = [
    ...enabledNativeAccountApps.map((nativeAccountApp): AppPreferencesApp => ({
      type: 'native',
      id: nativeAccountApp.id,
      nativeAccountApp,
    })),
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
      toolbar={
        isDefined(error) && !hasLoadedApplicationsWithPreferences ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`Your installed apps could not be loaded. Check your connection and try again.`}
              onRetry={() => refetch().catch(() => undefined)}
            />
          </StyledToolbar>
        ) : undefined
      }
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
