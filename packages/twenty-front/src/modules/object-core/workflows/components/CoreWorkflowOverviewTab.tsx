import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { CoreWorkflowOverviewWidget } from '@/object-core/workflows/components/CoreWorkflowOverviewWidget';
import { CoreWorkflowRecentFailedRuns } from '@/object-core/workflows/components/CoreWorkflowRecentFailedRuns';
import { CoreWorkflowRunsPerDayChart } from '@/object-core/workflows/components/CoreWorkflowRunsPerDayChart';
import { useCoreWorkflowRunInsights } from '@/object-core/workflows/hooks/useCoreWorkflowRunInsights';
import { StandaloneWidgetProvider } from '@/page-layout/widgets/components/StandaloneWidgetProvider';
import { GraphWidgetAggregateChart } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChart';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { formatDuration } from '~/utils/format/formatDuration';

const StyledOverview = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledStatGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledPanelGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
`;

type CoreWorkflowOverviewTabProps = {
  coreWorkflowId: string;
};

export const CoreWorkflowOverviewTab = ({
  coreWorkflowId,
}: CoreWorkflowOverviewTabProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { insights, loading, error } =
    useCoreWorkflowRunInsights(coreWorkflowId);

  if (!isDefined(insights) && loading) {
    return (
      <StyledOverview>
        <SkeletonLine height={96} />
        <SkeletonLine height={280} />
      </StyledOverview>
    );
  }

  if (!isDefined(insights)) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder
          type={isDefined(error) ? 'errorIndex' : 'emptyTimeline'}
        />
        <EmptyState.Content>
          <EmptyState.Title>{t`Could not load run insights`}</EmptyState.Title>
          <EmptyState.Description>{t`Try again in a moment`}</EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  const {
    runCount,
    failedRunCount,
    isRunCountLowerBound,
    averageDurationInMs,
    dailyRunCounts,
    recentFailedRuns,
  } = insights;

  return (
    <StandaloneWidgetProvider
      instanceId={`core-workflow-overview-${coreWorkflowId}`}
    >
      <StyledOverview>
        <StyledStatGrid>
          <CoreWorkflowOverviewWidget widgetId="runs" title={t`Runs · 14d`}>
            <GraphWidgetAggregateChart
              value={formatNumber(runCount)}
              suffix={isRunCountLowerBound ? '+' : undefined}
            />
          </CoreWorkflowOverviewWidget>
          <CoreWorkflowOverviewWidget
            widgetId="failed-runs"
            title={t`Failed · 14d`}
          >
            <GraphWidgetAggregateChart value={formatNumber(failedRunCount)} />
          </CoreWorkflowOverviewWidget>
          <CoreWorkflowOverviewWidget
            widgetId="failure-rate"
            title={t`Failure rate`}
          >
            <GraphWidgetAggregateChart
              value={
                runCount > 0
                  ? formatNumber((failedRunCount / runCount) * 100, {
                      decimals: 1,
                    })
                  : '-'
              }
              suffix={runCount > 0 ? '%' : undefined}
            />
          </CoreWorkflowOverviewWidget>
          <CoreWorkflowOverviewWidget
            widgetId="average-duration"
            title={t`Avg duration`}
          >
            <GraphWidgetAggregateChart
              value={
                isDefined(averageDurationInMs)
                  ? formatDuration(Math.round(averageDurationInMs))
                  : '-'
              }
            />
          </CoreWorkflowOverviewWidget>
        </StyledStatGrid>
        <StyledPanelGrid>
          <CoreWorkflowOverviewWidget
            widgetId="runs-per-day"
            title={t`Runs per day`}
          >
            <CoreWorkflowRunsPerDayChart
              coreWorkflowId={coreWorkflowId}
              dailyRunCounts={dailyRunCounts}
            />
          </CoreWorkflowOverviewWidget>
          <CoreWorkflowOverviewWidget
            widgetId="recent-failed-runs"
            title={t`Recent failed runs`}
          >
            <CoreWorkflowRecentFailedRuns failedRuns={recentFailedRuns} />
          </CoreWorkflowOverviewWidget>
        </StyledPanelGrid>
      </StyledOverview>
    </StandaloneWidgetProvider>
  );
};
