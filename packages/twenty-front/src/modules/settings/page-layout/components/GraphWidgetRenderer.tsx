import { GraphWidgetBarChart } from '@/dashboards/widgets/graph/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/widgets/graph/components/GraphWidgetGaugeChart';
import { GraphWidgetLineChart } from '@/dashboards/widgets/graph/components/GraphWidgetLineChart';
import { GraphWidgetNumberChart } from '@/dashboards/widgets/graph/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/widgets/graph/components/GraphWidgetPieChart';
import { GraphType } from '../mocks/mockWidgets';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  const graphType = widget.configuration?.graphType;

  if (!graphType || typeof graphType !== 'string') {
    return null;
  }

  if (!Object.values(GraphType).includes(graphType as GraphType)) {
    return null;
  }

  switch (graphType as GraphType) {
    case GraphType.NUMBER:
      return (
        <GraphWidgetNumberChart
          value={widget.data.value}
          trendPercentage={widget.data.trendPercentage}
        />
      );

    case GraphType.GAUGE:
      return (
        <GraphWidgetGaugeChart
          data={{
            value: widget.data.value,
            min: widget.data.min,
            max: widget.data.max,
            label: widget.data.label,
          }}
          displayType="percentage"
          showValue
          id={`gauge-chart-${widget.id}`}
        />
      );

    case GraphType.PIE:
      return (
        <GraphWidgetPieChart
          data={widget.data.items}
          showLegend
          displayType="percentage"
          id={`pie-chart-${widget.id}`}
        />
      );

    case GraphType.BAR:
      return (
        <GraphWidgetBarChart
          data={widget.data.items}
          indexBy={widget.data.indexBy}
          keys={widget.data.keys}
          seriesLabels={widget.data.seriesLabels}
          layout={widget.data.layout}
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
          data={widget.data.series}
          enableArea={widget.data.enableArea}
          showLegend={widget.data.showLegend}
          showGrid={widget.data.showGrid}
          enablePoints={widget.data.enablePoints}
          xAxisLabel={widget.data.xAxisLabel}
          yAxisLabel={widget.data.yAxisLabel}
          displayType={widget.data.displayType}
          prefix={widget.data.prefix}
          suffix={widget.data.suffix}
          xScale={widget.data.xScale}
          yScale={widget.data.yScale}
          curve={widget.data.curve}
          stackedArea={widget.data.stackedArea}
          enableSlices={widget.data.enableSlices}
        />
      );

    default:
      return null;
  }
};
