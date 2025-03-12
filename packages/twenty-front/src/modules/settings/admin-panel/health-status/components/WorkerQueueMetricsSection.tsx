import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
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

const StyledControlsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

export const WorkerQueueMetricsSection = ({
  queue,
}: WorkerQueueMetricsSectionProps) => {
  const [timeRange, setTimeRange] = useState(QueueMetricsTimeRange.OneHour);

  return (
    <StyledContainer>
      <Section>
        <StyledControlsContainer>
          <H2Title title={queue.queueName} description={t`Queue performance`} />
          <Select
            dropdownId={`timerange-${queue.queueName}`}
            value={timeRange}
            options={[
              { value: QueueMetricsTimeRange.SevenDays, label: t`This week` },
              { value: QueueMetricsTimeRange.OneDay, label: t`Today` },
              {
                value: QueueMetricsTimeRange.TwelveHours,
                label: t`Last 12 hours`,
              },
              {
                value: QueueMetricsTimeRange.FourHours,
                label: t`Last 4 hours`,
              },
              { value: QueueMetricsTimeRange.OneHour, label: t`Last 1 hour` },
            ]}
            onChange={setTimeRange}
            needIconCheck
            selectSizeVariant="small"
          />
        </StyledControlsContainer>
      </Section>
      <WorkerMetricsGraph
        queueName={queue.queueName}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </StyledContainer>
  );
};
