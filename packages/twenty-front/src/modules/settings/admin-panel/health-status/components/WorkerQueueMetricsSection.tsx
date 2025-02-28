import { useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import {
  AdminPanelWorkerQueueHealth,
  QueueMetricsTimeRange,
} from '~/generated/graphql';
import { WorkerMetricsGraph } from './WorkerMetricsGraph';

type WorkerQueueMetricsSectionProps = {
  queue: AdminPanelWorkerQueueHealth;
};

export const WorkerQueueMetricsSection = ({
  queue,
}: WorkerQueueMetricsSectionProps) => {
  const [timeRange, setTimeRange] = useState(QueueMetricsTimeRange.OneHour);

  return (
    <Section>
      <H2Title title={queue.queueName} description="Queue performance" />
      <WorkerMetricsGraph
        queueName={queue.queueName}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </Section>
  );
};
