import { GraphType } from '../mocks/mockWidgets';

export const getDefaultWidgetData = (graphType: GraphType) => {
  switch (graphType) {
    case GraphType.NUMBER:
      return {
        value: '1,234',
        trendPercentage: 15.2,
      };

    case GraphType.GAUGE:
      return {
        value: 0.7,
        min: 0,
        max: 1,
        label: 'Progress',
      };

    case GraphType.PIE:
      return {
        items: [
          { id: 'segment1', value: 35, label: 'Segment A' },
          { id: 'segment2', value: 28, label: 'Segment B' },
          { id: 'segment3', value: 20, label: 'Segment C' },
          { id: 'segment4', value: 17, label: 'Segment D' },
        ],
      };

    case GraphType.BAR:
      return {
        items: [
          { category: 'Jan', value: 45 },
          { category: 'Feb', value: 52 },
          { category: 'Mar', value: 48 },
          { category: 'Apr', value: 61 },
          { category: 'May', value: 55 },
        ],
        indexBy: 'category',
        keys: ['value'],
        seriesLabels: { value: 'Value' },
        layout: 'vertical' as const,
      };

    case GraphType.LINE:
      return {
        series: [
          {
            id: 'revenue',
            label: 'Revenue',
            color: 'blue',
            data: [
              { x: 0, y: 30 },
              { x: 1, y: 50 },
              { x: 2, y: 45 },
              { x: 3, y: 70 },
              { x: 4, y: 65 },
              { x: 5, y: 80 },
              { x: 6, y: 75 },
              { x: 7, y: 85 },
            ],
            enableArea: true,
          },
          {
            id: 'costs',
            label: 'Costs',
            color: 'red',
            data: [
              { x: 0, y: 60 },
              { x: 1, y: 45 },
              { x: 2, y: 55 },
              { x: 3, y: 40 },
              { x: 4, y: 60 },
              { x: 5, y: 50 },
              { x: 6, y: 70 },
              { x: 7, y: 65 },
            ],
            enableArea: true,
          },
          {
            id: 'profit',
            label: 'Profit',
            color: 'turquoise',
            data: [
              { x: 0, y: 45 },
              { x: 1, y: 60 },
              { x: 2, y: 35 },
              { x: 3, y: 55 },
              { x: 4, y: 50 },
              { x: 5, y: 65 },
              { x: 6, y: 40 },
              { x: 7, y: 75 },
            ],
            enableArea: true,
          },
        ],
        enableArea: true,
        showLegend: true,
        showGrid: true,
        enablePoints: false,
        xAxisLabel: 'Time',
        yAxisLabel: 'Value',
        curve: 'monotoneX',
        displayType: 'shortNumber',
        prefix: '$',
        suffix: '',
        xScale: { type: 'linear' },
        yScale: { type: 'linear', min: 0, max: 'auto' },
        stackedArea: false,
        enableSlices: false,
      };

    default:
      return {};
  }
};

export const getWidgetTitle = (graphType: GraphType, index: number): string => {
  const baseNames: Record<GraphType, string> = {
    [GraphType.NUMBER]: 'Number',
    [GraphType.GAUGE]: 'Gauge',
    [GraphType.PIE]: 'Pie Chart',
    [GraphType.BAR]: 'Bar Chart',
    [GraphType.LINE]: 'Line Chart',
  };

  return `${baseNames[graphType] || 'Widget'} ${index + 1}`;
};

export const getWidgetSize = (graphType: GraphType) => {
  switch (graphType) {
    case GraphType.NUMBER:
      return { w: 3, h: 2 };
    case GraphType.GAUGE:
      return { w: 3, h: 3 };
    case GraphType.PIE:
      return { w: 4, h: 4 };
    case GraphType.BAR:
      return { w: 6, h: 4 };
    case GraphType.LINE:
      return { w: 6, h: 10 };
    default:
      return { w: 4, h: 4 };
  }
};
