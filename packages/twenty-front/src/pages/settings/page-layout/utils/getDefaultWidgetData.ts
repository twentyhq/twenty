import { type GraphSubType } from '../mocks/mockWidgets';

export const getDefaultWidgetData = (graphType: GraphSubType) => {
  switch (graphType) {
    case 'number':
      return {
        value: '1,234',
        trendPercentage: 15.2,
      };
    
    case 'gauge':
      return {
        value: 0.7,
        min: 0,
        max: 1,
        label: 'Progress',
      };
    
    case 'pie':
      return {
        items: [
          { id: 'segment1', value: 35, label: 'Segment A' },
          { id: 'segment2', value: 28, label: 'Segment B' },
          { id: 'segment3', value: 20, label: 'Segment C' },
          { id: 'segment4', value: 17, label: 'Segment D' },
        ],
      };
    
    case 'bar':
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
    
    case 'line':
      return {
        items: [
          { x: 'Mon', y: 20 },
          { x: 'Tue', y: 35 },
          { x: 'Wed', y: 25 },
          { x: 'Thu', y: 40 },
          { x: 'Fri', y: 30 },
        ],
        indexBy: 'x',
        keys: ['y'],
      };
    
    default:
      return {};
  }
};

export const getWidgetTitle = (graphType: GraphSubType, index: number): string => {
  const baseNames: Record<GraphSubType, string> = {
    number: 'Number',
    gauge: 'Gauge',
    pie: 'Pie Chart',
    bar: 'Bar Chart',
    line: 'Line Chart',
    area: 'Area Chart',
  };
  
  return `${baseNames[graphType] || 'Widget'} ${index + 1}`;
};

export const getWidgetSize = (graphType: GraphSubType) => {
  switch (graphType) {
    case 'number':
      return { w: 3, h: 2 };
    case 'gauge':
      return { w: 3, h: 3 };
    case 'pie':
      return { w: 4, h: 4 };
    case 'bar':
    case 'line':
    case 'area':
      return { w: 6, h: 4 };
    default:
      return { w: 4, h: 4 };
  }
};