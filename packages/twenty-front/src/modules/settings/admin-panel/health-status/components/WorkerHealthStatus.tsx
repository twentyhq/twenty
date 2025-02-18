import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueHealthButtons';
import styled from '@emotion/styled';
import { useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelIndicatorHealthStatusInputEnum,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';

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
  const { data, loading } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorName: AdminPanelIndicatorHealthStatusInputEnum.WORKER,
    },
    fetchPolicy: 'network-only',
  });
  const isWorkerDown =
    !data?.getIndicatorHealthStatus.status ||
    data?.getIndicatorHealthStatus.status ===
      AdminPanelHealthServiceStatus.OUTAGE;

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
            queues={data?.getIndicatorHealthStatus.queues ?? []}
            selectedQueue={selectedQueue}
            toggleQueueVisibility={toggleQueueVisibility}
          />
          <SettingsAdminQueueExpandableContainer
            queues={data?.getIndicatorHealthStatus.queues ?? []}
            selectedQueue={selectedQueue}
          />
        </>
      )}
    </Section>
  );
};
