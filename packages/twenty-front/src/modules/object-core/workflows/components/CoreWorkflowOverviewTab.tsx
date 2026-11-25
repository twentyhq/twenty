import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { CoreObjectRunInsightsOverview } from '@/object-core/components/CoreObjectRunInsightsOverview';
import { CoreObjectRunsPerDayChart } from '@/object-core/components/CoreObjectRunsPerDayChart';
import { CoreWorkflowRecentFailedRuns } from '@/object-core/workflows/components/CoreWorkflowRecentFailedRuns';
import { type CoreWorkflowRunInsights } from '@/object-core/workflows/types/CoreWorkflowRunInsights';
import { formatDuration } from '~/utils/format/formatDuration';

type CoreWorkflowOverviewTabProps = {
  coreWorkflowId: string;
  insights: CoreWorkflowRunInsights | null;
  isLoading: boolean;
  hasError: boolean;
};

export const CoreWorkflowOverviewTab = ({
  coreWorkflowId,
  insights,
  isLoading,
  hasError,
}: CoreWorkflowOverviewTabProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  if (!isDefined(insights)) {
    return (
      <CoreObjectRunInsightsOverview
        hasInsights={false}
        isLoading={isLoading}
        hasError={hasError}
        stats={[]}
        panels={[]}
      />
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
    <CoreObjectRunInsightsOverview
      hasInsights
      isLoading={isLoading}
      hasError={hasError}
      stats={[
        {
          title: t`Runs · 14d`,
          value: formatNumber(runCount),
          suffix: isRunCountLowerBound ? '+' : undefined,
        },
        { title: t`Failed · 14d`, value: formatNumber(failedRunCount) },
        {
          title: t`Failure rate`,
          value:
            runCount > 0
              ? formatNumber((failedRunCount / runCount) * 100, {
                  decimals: 1,
                })
              : '-',
          suffix: runCount > 0 ? '%' : undefined,
        },
        {
          title: t`Avg duration`,
          value: isDefined(averageDurationInMs)
            ? formatDuration(Math.round(averageDurationInMs))
            : '-',
        },
      ]}
      panels={[
        {
          title: t`Runs per day`,
          content: (
            <CoreObjectRunsPerDayChart
              chartInstanceId={`core-workflow-runs-per-day-${coreWorkflowId}`}
              dailyRunCounts={dailyRunCounts}
            />
          ),
        },
        {
          title: t`Recent failed runs`,
          content: (
            <CoreWorkflowRecentFailedRuns failedRuns={recentFailedRuns} />
          ),
        },
      ]}
    />
  );
};
