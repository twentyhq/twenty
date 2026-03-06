import { SettingsAdminWorkerQueueMetricsSection } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerQueueMetricsSection';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated-metadata/graphql';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminWorkerHealthStatus = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);

  const isWorkerDown =
    !indicatorHealth.status ||
    indicatorHealth.status === AdminPanelHealthServiceStatus.OUTAGE;

  return (
    <>
      {isWorkerDown ? (
        <StyledErrorMessage>
          {t`Queue information is not available because the worker is down`}
        </StyledErrorMessage>
      ) : (
        (indicatorHealth.queues ?? []).map((queue) => (
          <SettingsAdminWorkerQueueMetricsSection
            key={queue.queueName}
            queue={queue}
          />
        ))
      )}
    </>
  );
};
