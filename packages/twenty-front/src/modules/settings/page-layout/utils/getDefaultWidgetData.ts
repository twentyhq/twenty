import { GraphSubType } from '../mocks/mockWidgets';

export const getDefaultWidgetData = (graphType: GraphSubType) => {
  switch (graphType) {
    case GraphSubType.NUMBER:
      return {
        value: '1,234',
        trendPercentage: 15.2,
      };

    case GraphSubType.GAUGE:
      return {
        value: 0.7,
        min: 0,
        max: 1,
        label: 'Progress',
      };

    case GraphSubType.PIE:
      return {
        items: [
          { id: 'segment1', value: 35, label: 'Segment A' },
          { id: 'segment2', value: 28, label: 'Segment B' },
          { id: 'segment3', value: 20, label: 'Segment C' },
          { id: 'segment4', value: 17, label: 'Segment D' },
        ],
      };

    case GraphSubType.BAR:
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

export const getWidgetTitle = (
  graphType: GraphSubType,
  index: number,
): string => {
  const baseNames: Record<GraphSubType, string> = {
    [GraphSubType.NUMBER]: 'Number',
    [GraphSubType.GAUGE]: 'Gauge',
    [GraphSubType.PIE]: 'Pie Chart',
    [GraphSubType.BAR]: 'Bar Chart',
  };

  return `${baseNames[graphType] || 'Widget'} ${index + 1}`;
};

export const getWidgetSize = (graphType: GraphSubType) => {
  switch (graphType) {
    case GraphSubType.NUMBER:
      return { w: 3, h: 2 };
    case GraphSubType.GAUGE:
      return { w: 3, h: 3 };
    case GraphSubType.PIE:
      return { w: 4, h: 4 };
    case GraphSubType.BAR:
      return { w: 6, h: 4 };
    default:
      return { w: 4, h: 4 };
  }
};
