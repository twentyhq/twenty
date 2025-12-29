import { SettingsAdminWorkerQueueMetricsSection } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerQueueMetricsSection';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated-metadata/graphql';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
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
