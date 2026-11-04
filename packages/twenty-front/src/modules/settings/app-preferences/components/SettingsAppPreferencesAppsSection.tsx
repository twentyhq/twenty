import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { useBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppStatusesById';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { getAppPreferencesAppStatusesById } from '@/settings/app-preferences/utils/getAppPreferencesAppStatusesById';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
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
  const {
    groups,
    loading: accountGroupsLoading,
    hasLoaded: hasLoadedAccountGroups,
    error: accountGroupsError,
    refetch: refetchAccountGroups,
  } = useMyAccountGroups();
  const {
    statusesById: builtInMcpClientAppStatusesById,
    isLoading: isLoadingBuiltInMcpClientAppStatuses,
    hasLoadError: hasBuiltInMcpClientAppStatusesLoadError,
    refetch: refetchBuiltInMcpClientAppStatuses,
  } = useBuiltInMcpClientAppStatusesById();
  const isLoadingApplications =
    loading && !hasLoadedApplicationsWithPreferences;
  const isLoadingStatuses =
    (accountGroupsLoading && !hasLoadedAccountGroups) ||
    isLoadingBuiltInMcpClientAppStatuses;
  const hasAccountGroupsLoadError = isDefined(accountGroupsError);
  const hasConnectionsLoadError =
    hasAccountGroupsLoadError || hasBuiltInMcpClientAppStatusesLoadError;
  const statusesById =
    isLoadingStatuses || hasConnectionsLoadError
      ? {}
      : {
          ...getAppPreferencesAppStatusesById({
            groups,
            builtInAccountApps: enabledBuiltInAccountApps,
            applicationsWithPreferences,
          }),
          ...builtInMcpClientAppStatusesById,
        };

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      toolbar={
        hasApplicationsLoadError || hasConnectionsLoadError ? (
          <StyledToolbar>
            {hasApplicationsLoadError && (
              <SettingsApplicationLoadErrorBanner
                message={t`Your installed apps could not be loaded. Check your connection and try again.`}
                onRetry={() => refetch().catch(() => undefined)}
              />
            )}
            {hasConnectionsLoadError && (
              <SettingsApplicationLoadErrorBanner
                message={t`Your connections could not be loaded. Check your connection and try again.`}
                onRetry={() =>
                  Promise.all([
                    hasAccountGroupsLoadError ? refetchAccountGroups() : null,
                    hasBuiltInMcpClientAppStatusesLoadError
                      ? refetchBuiltInMcpClientAppStatuses()
                      : null,
                  ]).catch(() => undefined)
                }
              />
            )}
          </StyledToolbar>
        ) : undefined
      }
      applications={applicationsWithPreferences.map(
        ({ application }) => application,
      )}
      builtInApps={[...enabledBuiltInAccountApps, ...BUILT_IN_MCP_CLIENT_APPS]}
      linkTarget="applicationPreferences"
      middleColumn="status"
      statusesById={statusesById}
      isLoading={isLoadingApplications}
      isLoadingStatuses={isLoadingStatuses}
    />
  );
};
