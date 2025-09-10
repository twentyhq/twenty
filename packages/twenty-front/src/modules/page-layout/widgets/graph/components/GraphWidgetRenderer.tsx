import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/page-layout/widgets/graph/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/page-layout/widgets/graph/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/page-layout/widgets/graph/components/GraphWidgetPieChart';
import { GraphType } from '../../../mocks/mockWidgets';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidgetWithData;
};

// TODO: Remove this once we query the data from the database
const getDefaultWidgetData = (graphType: GraphType) => {
  switch (graphType) {
    case GraphType.NUMBER:
      return {
        value: '0',
        trendPercentage: 0,
      };

    case GraphType.GAUGE:
      return {
        value: 0,
        min: 0,
        max: 100,
        label: 'Default Gauge',
      };

    case GraphType.PIE:
      return {
        items: [
          {
            id: 'category-1',
            value: 50,
            label: 'Category 1',
            to: '/default/category-1',
          },
          {
            id: 'category-2',
            value: 30,
            label: 'Category 2',
            to: '/default/category-2',
          },
          {
            id: 'category-3',
            value: 20,
            label: 'Category 3',
            to: '/default/category-3',
          },
        ],
      };

    case GraphType.BAR:
      return {
        items: [
          {
            period: 'Q1',
            value1: 100,
            value2: 80,
            to: '/default/q1',
          },
          {
            period: 'Q2',
            value1: 120,
            value2: 90,
            to: '/default/q2',
          },
          {
            period: 'Q3',
            value1: 110,
            value2: 95,
            to: '/default/q3',
          },
        ],
        indexBy: 'period',
        keys: ['value1', 'value2'],
        seriesLabels: ['Series 1', 'Series 2'],
        layout: 'vertical' as const,
      };

    default:
      return null;
  }
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  const graphType = widget.configuration?.graphType;

  if (!graphType || typeof graphType !== 'string') {
    return null;
  }

  if (!Object.values(GraphType).includes(graphType as GraphType)) {
    return null;
  }

  const data = widget.data ?? getDefaultWidgetData(graphType as GraphType);

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

    default:
      return null;
  }
};
