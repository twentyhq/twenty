import { GraphWidgetBarChart } from '@/dashboards/widgets/graph/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/widgets/graph/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/widgets/graph/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/widgets/graph/components/GraphWidgetPieChart';
import { type ReactNode } from 'react';
import { GraphSubType } from '../mocks/mockWidgets';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';

type GraphRenderer = (widget: PageLayoutWidget) => ReactNode;

const graphRenderers: Record<GraphSubType, GraphRenderer> = {
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

export const renderGraphWidget = (widget: PageLayoutWidget): ReactNode => {
  const graphType = widget.configuration?.graphType;

  if (!graphType || typeof graphType !== 'string') {
    return null;
  }

  if (!Object.values(GraphSubType).includes(graphType as GraphSubType)) {
    return null;
  }

  const renderer = graphRenderers[graphType as GraphSubType];
  if (!renderer) {
    return null;
  }

  return renderer(widget);
};
