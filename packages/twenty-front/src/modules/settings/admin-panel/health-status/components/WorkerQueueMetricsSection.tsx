import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  AdminPanelWorkerQueueHealth,
  QueueMetricsTimeRange,
} from '~/generated/graphql';
import { WorkerMetricsGraph } from './WorkerMetricsGraph';
import { getWorkerQueueMetricsSelectOptions } from '@/settings/admin-panel/health-status/constants/WorkerQueueMetricsSelectOptions';

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
  const { t } = useLingui();
  const [timeRange, setTimeRange] = useState(QueueMetricsTimeRange.OneHour);

  return (
    <StyledContainer>
      <Section>
        <StyledControlsContainer>
          <H2Title title={queue.queueName} description={t`Queue performance`} />
          <Select
            dropdownId={`timerange-${queue.queueName}`}
            value={timeRange}
            options={getWorkerQueueMetricsSelectOptions(t)}
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
