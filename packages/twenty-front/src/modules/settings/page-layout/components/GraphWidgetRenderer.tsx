import { GraphWidgetBarChart } from '@/dashboards/widgets/graph/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/widgets/graph/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/widgets/graph/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/widgets/graph/components/GraphWidgetPieChart';
import { GraphSubType } from '../mocks/mockWidgets';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  const graphType = widget.configuration?.graphType;

  if (!graphType || typeof graphType !== 'string') {
    return null;
  }

  if (!Object.values(GraphSubType).includes(graphType as GraphSubType)) {
    return null;
  }

  switch (graphType as GraphSubType) {
    case GraphSubType.NUMBER:
      return (
        <GraphWidgetNumberChart
          value={widget.data.value}
          trendPercentage={widget.data.trendPercentage}
        />
      );

    case GraphSubType.GAUGE:
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

    case GraphSubType.PIE:
      return (
        <GraphWidgetPieChart
          data={widget.data.items}
          showLegend
          displayType="percentage"
          id={`pie-chart-${widget.id}`}
        />
      );

    case GraphSubType.BAR:
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

    default:
      return null;
  }
};
