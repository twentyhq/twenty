import { WorkerQueueMetricsSection } from '@/settings/admin-panel/health-status/components/WorkerQueueMetricsSection';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AdminPanelHealthServiceStatus } from '~/generated-metadata/graphql';
import { SettingsAdminIndicatorHealthContext } from '../contexts/SettingsAdminIndicatorHealthContext';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const WorkerHealthStatus = () => {
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
          <WorkerQueueMetricsSection key={queue.queueName} queue={queue} />
        ))
      )}
    </>
  );
};
