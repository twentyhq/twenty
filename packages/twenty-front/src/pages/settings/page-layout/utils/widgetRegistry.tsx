import { GraphWidgetBarChart } from '@/dashboards/graphs/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { type ReactNode } from 'react';
import { type GraphSubType, type Widget } from '../mocks/mockWidgets';

type WidgetRenderer = (widget: Widget) => ReactNode;

const widgetRenderers: Record<GraphSubType, WidgetRenderer> = {
  number: (widget) => (
    <GraphWidgetNumberChart
      value={widget.data.value}
      trendPercentage={widget.data.trendPercentage}
    />
  ),
  gauge: (widget) => (
    <GraphWidgetGaugeChart
      data={{
        value: widget.data.value,
        min: widget.data.min,
        max: widget.data.max,
        label: widget.data.label,
      }}
      displayType="percentage"
      showValue={true}
      id={`gauge-chart-${widget.id}`}
    />
  ),
  pie: (widget) => (
    <GraphWidgetPieChart
      data={widget.data.items}
      showLegend={true}
      displayType="percentage"
      id={`pie-chart-${widget.id}`}
    />
  ),
  bar: (widget) => (
    <GraphWidgetBarChart
      data={widget.data.items}
      indexBy={widget.data.indexBy}
      keys={widget.data.keys}
      seriesLabels={widget.data.seriesLabels}
      layout={widget.data.layout}
      showLegend={true}
      showGrid={true}
      displayType="number"
      id={`bar-chart-${widget.id}`}
    />
  ),
  line: () => {
    // TODO: Implement line chart when component is available
    return <div>Line chart not yet implemented</div>;
  },
};

export const renderWidget = (widget: Widget): ReactNode => {
  if (widget.type !== 'GRAPH' || !widget.graphType) {
    return null;
  }

  const renderer = widgetRenderers[widget.graphType];
  if (!renderer) {
    return null;
  }

  return renderer(widget);
};
