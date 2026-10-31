import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useInstalledBuiltInAccountApps } from '@/settings/applications/hooks/useInstalledBuiltInAccountApps';
import { useWorkspaceApplicationStatusesById } from '@/settings/applications/hooks/useWorkspaceApplicationStatusesById';
import { collapseWellKnownOAuthClientApplications } from '@/settings/applications/utils/collapseWellKnownOAuthClientApplications';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationsInstalledAppsSection = () => {
  const { t } = useLingui();
  const installedApplications = useInstalledApplications();
  const installedBuiltInAccountApps = useInstalledBuiltInAccountApps();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const displayedApplications = isAppPreferencesEnabled
    ? collapseWellKnownOAuthClientApplications(installedApplications)
    : installedApplications;
  const {
    statusesById,
    error: statusError,
    refetch: refetchStatuses,
  } = useWorkspaceApplicationStatusesById({
    applications: displayedApplications,
    shouldSkip: !isAppPreferencesEnabled,
  });

  if (displayedApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      title={t`Installed apps`}
      description={t`All the applications currently installed on this workspace`}
      toolbar={
        isDefined(statusError) ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`App configuration could not be loaded. Check your connection and try again.`}
              // A failed retry sets the query error again, so the banner stays
              onRetry={() => refetchStatuses().catch(() => undefined)}
            />
          </StyledToolbar>
        ) : undefined
      }
      applications={displayedApplications}
      builtInApps={installedBuiltInAccountApps}
      linkTarget="applicationDetail"
      middleColumn={isAppPreferencesEnabled ? 'typeOrStatus' : 'type'}
      statusesById={statusesById}
    />
  );
};
