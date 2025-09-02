import { GraphWidgetBarChart } from '@/dashboards/graphs/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { type ReactNode } from 'react';
import { GraphSubType, WidgetType, type Widget } from '../mocks/mockWidgets';

type WidgetRenderer = (widget: Widget) => ReactNode;

const widgetRenderers: Record<GraphSubType, WidgetRenderer> = {
  [GraphSubType.NUMBER]: (widget) => (
    <GraphWidgetNumberChart
      value={widget.data.value}
      trendPercentage={widget.data.trendPercentage}
    />
  ),
  [GraphSubType.GAUGE]: (widget) => (
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
  ),
  [GraphSubType.PIE]: (widget) => (
    <GraphWidgetPieChart
      data={widget.data.items}
      showLegend
      displayType="percentage"
      id={`pie-chart-${widget.id}`}
    />
  ),
  [GraphSubType.BAR]: (widget) => (
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
  ),
};

export const renderWidget = (widget: Widget): ReactNode => {
  if (widget.type !== WidgetType.GRAPH) {
    return null;
  }

  const graphType = widget.configuration?.graphType as GraphSubType | undefined;
  if (!graphType) {
    return null;
  }

  const renderer = widgetRenderers[graphType];
  if (!renderer) {
    return null;
  }

  return renderer(widget);
};
