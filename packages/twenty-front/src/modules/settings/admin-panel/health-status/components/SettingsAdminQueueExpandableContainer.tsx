import { SettingsListCard } from '@/settings/components/SettingsListCard';
import styled from '@emotion/styled';
import { AnimatedExpandableContainer, H2Title, Status } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';
import { WorkerMetricsGraph } from './WorkerMetricsGraph';

const StyledWorkerMetricsGraphContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

export const SettingsAdminQueueExpandableContainer = ({
  queues,
  selectedQueue,
}: {
  queues: AdminPanelWorkerQueueHealth[];
  selectedQueue: string | null;
}) => {
  const selectedQueueData = queues.find(
    (queue) => queue.queueName === selectedQueue,
  );

  return (
    <AnimatedExpandableContainer
      isExpanded={!!selectedQueue}
      mode="fit-content"
    >
      {selectedQueueData && (
        <>
          <StyledContainer>
            <SettingsListCard
              items={[
                { ...selectedQueueData, id: selectedQueueData.queueName },
              ]}
              getItemLabel={(
                item: AdminPanelWorkerQueueHealth & { id: string },
              ) => item.queueName}
              isLoading={false}
              RowRightComponent={({
                item,
              }: {
                item: AdminPanelWorkerQueueHealth;
              }) => (
                <Status
                  color={
                    item.status === AdminPanelHealthServiceStatus.OPERATIONAL
                      ? 'green'
                      : 'red'
                  }
                  text={item.status.toLowerCase()}
                  weight="medium"
                />
              )}
            />
          </StyledContainer>

          <H2Title title="Performance Over Time" />
          <StyledWorkerMetricsGraphContainer>
            <WorkerMetricsGraph queueName={selectedQueueData.queueName} />
          </StyledWorkerMetricsGraphContainer>
        </>
      )}
    </AnimatedExpandableContainer>
  );
};
