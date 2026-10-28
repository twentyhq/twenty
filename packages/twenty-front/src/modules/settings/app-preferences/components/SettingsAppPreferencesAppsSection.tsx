import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { getAppPreferencesAppStatusById } from '@/settings/app-preferences/utils/getAppPreferencesAppStatusById';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAppPreferencesAppsSection = () => {
  const { t } = useLingui();
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const {
    applicationsWithPreferences,
    loading,
    hasLoadedApplicationsWithPreferences,
    hasApplicationsLoadError,
    refetch,
  } = useApplicationsWithPreferences();
  const { groups, loading: accountGroupsLoading } = useMyAccountGroups();
  const isLoadingApplications =
    loading && !hasLoadedApplicationsWithPreferences;
  const statusById = accountGroupsLoading
    ? {}
    : getAppPreferencesAppStatusById({
        groups,
        builtInAccountApps: enabledBuiltInAccountApps,
        applicationsWithPreferences,
      });

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
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
      applications={applicationsWithPreferences.map(
        ({ application }) => application,
      )}
      builtInAccountApps={enabledBuiltInAccountApps}
      variant="member"
      statusById={statusById}
      isLoading={isLoadingApplications}
    />
  );
};
