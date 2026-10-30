import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useInstalledBuiltInApps } from '@/settings/applications/hooks/useInstalledBuiltInApps';
import { useWorkspaceApplicationStatusesById } from '@/settings/applications/hooks/useWorkspaceApplicationStatusesById';
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
  const installedBuiltInApps = useInstalledBuiltInApps();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const {
    statusesById,
    error: statusError,
    refetch: refetchStatuses,
  } = useWorkspaceApplicationStatusesById({
    applications: installedApplications,
    shouldSkip: !isAppPreferencesEnabled,
  });

  if (installedApplications.length === 0) {
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
      applications={installedApplications}
      builtInApps={installedBuiltInApps}
      linkTarget="applicationDetail"
      middleColumn={isAppPreferencesEnabled ? 'status' : 'type'}
      statusesById={statusesById}
    />
  );
};
