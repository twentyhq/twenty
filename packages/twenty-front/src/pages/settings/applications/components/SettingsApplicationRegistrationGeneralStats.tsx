import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  type ApplicationRegistration,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Section } from 'twenty-ui/components/layout';
import { IconHeartRateMonitor } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledStatsFooterActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
  isAdminView = false,
}: {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
}) => {
  const { t } = useLingui();
  const isApplicationMonitoringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_MONITORING_ENABLED,
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Statistics`}
        description={t`Usage across all non-deleted workspaces on this server`}
      />
      <SettingsApplicationRegistrationInstallStats
        registration={registration}
        isAdminView={isAdminView}
      />
      {isApplicationMonitoringEnabled && !isAdminView && (
        <StyledStatsFooterActions>
          <NavigationButton
            to={getSettingsPath(
              SettingsPath.ApplicationRegistrationMonitoring,
              {
                applicationRegistrationId: registration.id,
              },
            )}
            startIcon={<IconHeartRateMonitor />}
            size="sm"
            variant="outline"
          >{t`View monitoring`}</NavigationButton>
        </StyledStatsFooterActions>
      )}
      {isAdminView && (
        <SettingsApplicationRegistrationInstalledWorkspaces
          registration={registration}
        />
      )}
    </Section.Root>
  );
};
