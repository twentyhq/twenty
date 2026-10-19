import { styled } from '@linaria/react';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChart';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartSeries';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';

const StyledChartContainer = styled.div`
  height: 220px;
  width: 100%;
`;

type ApplicationMonitoringBarChartProps = {
  id: string;
  data: BarChartDatum[];
  series: BarChartSeriesWithColor[];
};

export const ApplicationMonitoringBarChart = ({
  id,
  data,
  series,
}: ApplicationMonitoringBarChartProps) => (
  <StyledChartContainer>
    <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
      <PageLayoutComponentInstanceContext.Provider value={{ instanceId: id }}>
        <WidgetComponentInstanceContext.Provider value={{ instanceId: id }}>
          <GraphWidgetBarChart
            id={id}
            data={data}
            indexBy="bucket"
            keys={series.map(({ key }) => key)}
            series={series}
            groupMode="stacked"
            colorMode="automaticPalette"
            showLegend
            showGrid
          />
        </WidgetComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </PageLayoutEditModeProviderContext>
  </StyledChartContainer>
);
