import { SettingsAdminWorkerQueueMetricsSection } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerQueueMetricsSection';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated-admin/graphql';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminWorkerHealthStatus = () => {
  const { t } = useLingui();
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
