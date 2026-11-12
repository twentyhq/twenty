import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { CoreAgentCreditsPerDayChart } from '@/object-core/agents/components/CoreAgentCreditsPerDayChart';
import { type CoreAgentRunInsights } from '@/object-core/agents/types/CoreAgentRunInsights';
import { CoreObjectRunInsightsOverview } from '@/object-core/components/CoreObjectRunInsightsOverview';
import { CoreObjectRunsPerDayChart } from '@/object-core/components/CoreObjectRunsPerDayChart';
import { formatDuration } from '~/utils/format/formatDuration';

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

type CoreAgentOverviewTabProps = {
  agentId: string;
  insights: CoreAgentRunInsights | null;
  loading: boolean;
  hasError: boolean;
};

export const CoreAgentOverviewTab = ({
  agentId,
  insights,
  loading,
  hasError,
}: CoreAgentOverviewTabProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  return (
    <StyledTabContent>
      <CoreObjectRunInsightsOverview
        hasInsights={isDefined(insights)}
        loading={loading}
        hasError={hasError}
        stats={
          isDefined(insights)
            ? [
                {
                  title: t`Runs · 14d`,
                  value: formatNumber(insights.runCount),
                },
                {
                  title: t`Credits · 14d`,
                  value: formatNumber(insights.credits, { decimals: 2 }),
                },
                {
                  title: t`Tokens · 14d`,
                  value: formatNumber(insights.tokenCount, {
                    abbreviate: true,
                  }),
                },
                {
                  title: t`Avg duration`,
                  value: isDefined(insights.averageDurationInMs)
                    ? formatDuration(Math.round(insights.averageDurationInMs))
                    : '-',
                },
              ]
            : []
        }
        panels={
          isDefined(insights)
            ? [
                {
                  title: t`Runs per day`,
                  content: (
                    <CoreObjectRunsPerDayChart
                      chartInstanceId={`core-agent-runs-per-day-${agentId}`}
                      dailyRunCounts={insights.dailyRunCounts}
                    />
                  ),
                },
                {
                  title: t`Credits per day`,
                  content: (
                    <CoreAgentCreditsPerDayChart
                      agentId={agentId}
                      dailyRunCounts={insights.dailyRunCounts}
                    />
                  ),
                },
              ]
            : []
        }
      />
    </StyledTabContent>
  );
};
