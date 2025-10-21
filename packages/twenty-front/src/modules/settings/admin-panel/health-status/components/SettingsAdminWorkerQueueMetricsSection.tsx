import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { WORKER_QUEUE_METRICS_SELECT_OPTIONS } from '@/settings/admin-panel/health-status/constants/WorkerQueueMetricsSelectOptions';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { lazy, Suspense, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconList } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  type AdminPanelWorkerQueueHealth,
  QueueMetricsTimeRange,
} from '~/generated-metadata/graphql';

const SettingsAdminWorkerMetricsGraph = lazy(() =>
  import('./SettingsAdminWorkerMetricsGraph').then((module) => ({
    default: module.SettingsAdminWorkerMetricsGraph,
  })),
);

type SettingsAdminWorkerQueueMetricsSectionProps = {
  queue: AdminPanelWorkerQueueHealth;
};

const StyledControlsContainer = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

const StyledRightControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

export const SettingsAdminWorkerQueueMetricsSection = ({
  queue,
}: SettingsAdminWorkerQueueMetricsSectionProps) => {
  const [timeRange, setTimeRange] = useState(QueueMetricsTimeRange.OneHour);

  return (
    <StyledContainer>
      <Section>
        <StyledControlsContainer>
          <H2Title title={queue.queueName} description={t`Queue performance`} />
          <StyledRightControls>
            <Button
              Icon={IconList}
              title={t`View Jobs`}
              size="small"
              variant="secondary"
              to={getSettingsPath(SettingsPath.AdminPanelQueueDetail, {
                queueName: queue.queueName,
              })}
            />
            <Select
              dropdownId={`timerange-${queue.queueName}`}
              value={timeRange}
              options={WORKER_QUEUE_METRICS_SELECT_OPTIONS.map((option) => ({
                ...option,
                label: t(option.label),
              }))}
              onChange={setTimeRange}
              needIconCheck
              selectSizeVariant="small"
            />
          </StyledRightControls>
        </StyledControlsContainer>
      </Section>
      <Suspense fallback={<ChartSkeletonLoader />}>
        <SettingsAdminWorkerMetricsGraph
          queueName={queue.queueName}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </Suspense>
    </StyledContainer>
  );
};
