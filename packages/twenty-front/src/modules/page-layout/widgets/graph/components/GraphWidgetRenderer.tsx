import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { getDefaultWidgetData } from '@/page-layout/utils/getDefaultWidgetData';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/page-layout/widgets/graph/components/GraphWidgetGaugeChart';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/components/GraphWidgetLineChart';
import { GraphWidgetNumberChart } from '@/page-layout/widgets/graph/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/page-layout/widgets/graph/components/GraphWidgetPieChart';
import { type GraphWidget } from '@/page-layout/widgets/graph/types/GraphWidget';

type GraphWidgetRendererProps = {
  widget: GraphWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  const graphType = widget.configuration?.graphType;

  if (!Object.values(GraphType).includes(graphType)) {
    return null;
  }

  const data = widget.data ?? getDefaultWidgetData(graphType);

  if (!data) {
    return null;
  }

  switch (graphType as GraphType) {
    case GraphType.NUMBER:
      return (
        <GraphWidgetNumberChart
          value={data.value}
          trendPercentage={data.trendPercentage}
        />
      );

    case GraphType.GAUGE:
      return (
        <GraphWidgetGaugeChart
          data={{
            value: data.value,
            min: data.min,
            max: data.max,
            label: data.label,
          }}
          displayType="percentage"
          showValue
          id={`gauge-chart-${widget.id}`}
        />
      );

    case GraphType.PIE:
      return (
        <GraphWidgetPieChart
          data={data.items}
          showLegend
          displayType="percentage"
          id={`pie-chart-${widget.id}`}
        />
      );

    case GraphType.BAR:
      return (
        <GraphWidgetBarChart
          data={data.items}
          indexBy={data.indexBy}
          keys={data.keys}
          seriesLabels={data.seriesLabels}
          layout={data.layout}
          showLegend
          showGrid
          displayType="number"
          id={`bar-chart-${widget.id}`}
        />
      );

    case GraphType.LINE:
      return (
        <GraphWidgetLineChart
          id={`line-chart-${widget.id}`}
          data={data.series}
          enableArea={data.enableArea}
          showLegend={data.showLegend}
          showGrid={data.showGrid}
          enablePoints={data.enablePoints}
          xAxisLabel={data.xAxisLabel}
          yAxisLabel={data.yAxisLabel}
          displayType={data.displayType}
          prefix={data.prefix}
          suffix={data.suffix}
          xScale={data.xScale}
          yScale={data.yScale}
          curve={data.curve}
          stackedArea={data.stackedArea}
          enableSlices={data.enableSlices}
        />
      );

    default:
      return null;
  }
};
