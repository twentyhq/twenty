import { styled } from '@linaria/react';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';

const StyledLineChartContainer = styled.div`
  height: 240px;
  width: 100%;
`;

type ApplicationMonitoringLineChartProps<TSeriesKey extends string> = {
  id: string;
  data: ApplicationMonitoringChartDatum<TSeriesKey>[];
  series: { key: TSeriesKey; label: string; color: GraphColor }[];
};

export const ApplicationMonitoringLineChart = <TSeriesKey extends string>({
  id,
  data,
  series,
}: ApplicationMonitoringLineChartProps<TSeriesKey>) => {
  const lineData: LineChartSeriesWithColor[] = series.map(
    ({ key, label, color }) => ({
      key,
      label,
      color,
      data: data.map((datum) => ({ x: datum.bucket, y: datum[key] })),
    }),
  );

  return (
    <SubscriptionInfoContainer>
      <StyledLineChartContainer>
        <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
          <WidgetComponentInstanceContext.Provider value={{ instanceId: id }}>
            <GraphWidgetLineChart
              id={id}
              data={lineData}
              colorMode="automaticPalette"
              enableArea
            />
          </WidgetComponentInstanceContext.Provider>
        </PageLayoutEditModeProviderContext>
      </StyledLineChartContainer>
    </SubscriptionInfoContainer>
  );
};
