import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, parseISO } from 'date-fns';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChart';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type GetCoreWorkflowRunInsightsQuery } from '~/generated/graphql';

type DailyRunCount = NonNullable<
  GetCoreWorkflowRunInsightsQuery['coreWorkflowRunInsights']
>['dailyRunCounts'][number];

const StyledChart = styled.div`
  height: 240px;
`;

type CoreWorkflowRunsPerDayChartProps = {
  coreWorkflowId: string;
  dailyRunCounts: DailyRunCount[];
};

export const CoreWorkflowRunsPerDayChart = ({
  coreWorkflowId,
  dailyRunCounts,
}: CoreWorkflowRunsPerDayChartProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const chartInstanceId = `core-workflow-runs-per-day-${coreWorkflowId}`;

  const data = dailyRunCounts.map((dailyRunCount) => ({
    day: format(parseISO(dailyRunCount.day), 'MMM d', {
      locale: localeCatalog,
    }),
    completed: dailyRunCount.completedRunCount,
    failed: dailyRunCount.failedRunCount,
    other: dailyRunCount.otherRunCount,
  }));

  return (
    <StyledChart>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: chartInstanceId }}
      >
        <GraphWidgetBarChart
          id={chartInstanceId}
          data={data}
          indexBy="day"
          keys={['completed', 'failed', 'other']}
          series={[
            { key: 'completed', label: t`Completed`, color: 'green' },
            { key: 'failed', label: t`Failed`, color: 'red' },
            { key: 'other', label: t`Other`, color: 'gray' },
          ]}
          colorMode="automaticPalette"
          groupMode="stacked"
          showGrid
          showLegend
        />
      </WidgetComponentInstanceContext.Provider>
    </StyledChart>
  );
};
