import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { CoreWorkflowOverviewCard } from '@/object-core/workflows/components/CoreWorkflowOverviewCard';
import { CoreWorkflowOverviewStatCard } from '@/object-core/workflows/components/CoreWorkflowOverviewStatCard';
import { CoreWorkflowRecentFailedRuns } from '@/object-core/workflows/components/CoreWorkflowRecentFailedRuns';
import { CoreWorkflowRunsPerDayChart } from '@/object-core/workflows/components/CoreWorkflowRunsPerDayChart';
import { useCoreWorkflowRunInsights } from '@/object-core/workflows/hooks/useCoreWorkflowRunInsights';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { formatDuration } from '~/utils/format/formatDuration';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

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

  if (!isDefined(insights)) {
    if (loading) {
      return (
        <StyledOverview>
          <SkeletonLine height={96} />
          <SkeletonLine height={280} />
        </StyledOverview>
      );
    }

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
    lastFailedRunAt,
    dailyRunCounts,
    recentFailedRuns,
  } = insights;

  const lowerBoundSuffix = isRunCountLowerBound ? '+' : '';
  const runsPerDay = formatNumber(runCount / dailyRunCounts.length, {
    decimals: 0,
  });
  const formattedRunCount = formatNumber(runCount);
  const formattedFailedRunCount = formatNumber(failedRunCount);
  const lastFailedRelativeDate = isDefined(lastFailedRunAt)
    ? beautifyPastDateRelativeToNow(lastFailedRunAt)
    : null;

  return (
    <StyledOverview>
      <StyledStatGrid>
        <CoreWorkflowOverviewStatCard
          label={t`Runs · 14d`}
          value={`${formattedRunCount}${lowerBoundSuffix}`}
          caption={t`${runsPerDay} per day`}
        />
        <CoreWorkflowOverviewStatCard
          label={t`Failed · 14d`}
          value={formattedFailedRunCount}
          caption={
            isDefined(lastFailedRelativeDate)
              ? t`Last failed ${lastFailedRelativeDate}`
              : t`No failures`
          }
        />
        <CoreWorkflowOverviewStatCard
          label={t`Failure rate`}
          value={
            runCount > 0
              ? `${formatNumber((failedRunCount / runCount) * 100, { decimals: 1 })}%`
              : '-'
          }
          caption={t`${formattedFailedRunCount} of ${formattedRunCount} runs`}
        />
        <CoreWorkflowOverviewStatCard
          label={t`Avg duration`}
          value={
            isDefined(averageDurationInMs)
              ? formatDuration(Math.round(averageDurationInMs))
              : '-'
          }
          caption={t`Completed runs`}
        />
      </StyledStatGrid>
      <StyledPanelGrid>
        <CoreWorkflowOverviewCard
          title={t`Runs per day`}
          caption={t`By status`}
        >
          <CoreWorkflowRunsPerDayChart
            coreWorkflowId={coreWorkflowId}
            dailyRunCounts={dailyRunCounts}
          />
        </CoreWorkflowOverviewCard>
        <CoreWorkflowOverviewCard title={t`Recent failed runs`}>
          <CoreWorkflowRecentFailedRuns failedRuns={recentFailedRuns} />
        </CoreWorkflowOverviewCard>
      </StyledPanelGrid>
    </StyledOverview>
  );
};
