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
    default:
      return { w: 4, h: 4 };
  }
};
