import { SettingsListCard } from '@/settings/components/SettingsListCard';
import styled from '@emotion/styled';
import { AnimatedExpandableContainer, Status } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';
import { WorkerMetricsGraph } from './WorkerMetricsGraph';

const StyledExpandedContent = styled.div`
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

const StyledQueueMetricsTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
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

          <StyledQueueMetricsTitle>
            Performance Over Time:
          </StyledQueueMetricsTitle>
          <StyledExpandedContent>
            <WorkerMetricsGraph queueName={selectedQueueData.queueName} />
          </StyledExpandedContent>
        </>
      )}
    </AnimatedExpandableContainer>
  );
};
