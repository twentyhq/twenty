import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueHealthButtons';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const WorkerHealthStatus = () => {
  const { indicatorHealth, loading } = useContext(
    SettingsAdminIndicatorHealthContext,
  );

  const isWorkerDown =
    !indicatorHealth.status ||
    indicatorHealth.status === AdminPanelHealthServiceStatus.OUTAGE;

  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const toggleQueueVisibility = (queueName: string) => {
    setSelectedQueue(selectedQueue === queueName ? null : queueName);
  };

  return (
    <Section>
      <StyledTitleContainer>
        <H2Title
          title="Queue Status"
          description="Background job processing status and metrics"
        />
      </StyledTitleContainer>
      {isWorkerDown && !loading ? (
        <StyledErrorMessage>
          Queue information is not available because the worker is down
        </StyledErrorMessage>
      ) : (
        <>
          <SettingsAdminQueueHealthButtons
            queues={indicatorHealth.queues ?? []}
            selectedQueue={selectedQueue}
            toggleQueueVisibility={toggleQueueVisibility}
          />
          <SettingsAdminQueueExpandableContainer
            queues={indicatorHealth.queues ?? []}
            selectedQueue={selectedQueue}
          />
        </>
      )}
    </Section>
  );
};
