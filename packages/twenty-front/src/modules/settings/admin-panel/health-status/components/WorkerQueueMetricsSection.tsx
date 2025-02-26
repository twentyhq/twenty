import styled from '@emotion/styled';
import { useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import {
  AdminPanelWorkerQueueHealth,
  QueueMetricsTimeRange,
} from '~/generated/graphql';
import { WorkerMetricsGraph } from './WorkerMetricsGraph';

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type WorkerQueueMetricsSectionProps = {
  queue: AdminPanelWorkerQueueHealth;
};

export const WorkerQueueMetricsSection = ({
  queue,
}: WorkerQueueMetricsSectionProps) => {
  const [timeRange, setTimeRange] = useState(QueueMetricsTimeRange.OneDay);

  return (
    <Section>
      <StyledTitleContainer>
        <H2Title title={queue.queueName} description="Queue performance" />
      </StyledTitleContainer>
      <WorkerMetricsGraph
        queueName={queue.queueName}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </Section>
  );
};
