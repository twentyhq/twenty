import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, parseISO } from 'date-fns';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { type CoreAgentRunInsights } from '@/object-core/agents/types/CoreAgentRunInsights';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChart';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledChart = styled.div`
  height: 240px;
`;

type CoreAgentCreditsPerDayChartProps = {
  agentId: string;
  dailyRunCounts: CoreAgentRunInsights['dailyRunCounts'];
};

export const CoreAgentCreditsPerDayChart = ({
  agentId,
  dailyRunCounts,
}: CoreAgentCreditsPerDayChartProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const chartInstanceId = `core-agent-credits-per-day-${agentId}`;

  const data = dailyRunCounts.map((dailyRunCount) => ({
    day: format(parseISO(dailyRunCount.day), 'MMM d', {
      locale: localeCatalog,
    }),
    credits: dailyRunCount.credits,
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
          keys={['credits']}
          series={[{ key: 'credits', label: t`Credits`, color: 'blue' }]}
          colorMode="automaticPalette"
          groupMode="stacked"
          showGrid
        />
      </WidgetComponentInstanceContext.Provider>
    </StyledChart>
  );
};
