import { type Layouts } from 'react-grid-layout';

// Aligned with backend WidgetType enum
export type WidgetType = 'VIEW' | 'IFRAME' | 'FIELDS' | 'GRAPH';

// Graph subtypes for different chart types
export type GraphSubType = 'number' | 'gauge' | 'pie' | 'bar' | 'line' | 'area';

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  // For GRAPH widgets, specify the chart type
  graphType?: GraphSubType;
  // Widget-specific data/configuration
  data?: any;
};

export const mockWidgets: Widget[] = [
  {
    id: 'widget-1',
    type: 'GRAPH',
    graphType: 'number',
    title: 'Sales Pipeline',
    data: {
      value: '1,234',
      trendPercentage: 12.5,
    },
  },
  {
    id: 'widget-2',
    type: 'GRAPH',
    graphType: 'gauge',
    title: 'Conversion Rate',
    data: {
      value: 0.5,
      min: 0,
      max: 1,
      label: 'Conversion rate',
    },
  },
  {
    id: 'widget-3',
    type: 'GRAPH',
    graphType: 'pie',
    title: 'Lead Distribution',
    data: {
      items: [
        {
          id: 'qualified',
          value: 35,
          label: 'Qualified',
          to: '/leads/qualified',
        },
        {
          id: 'contacted',
          value: 25,
          label: 'Contacted',
          to: '/leads/contacted',
        },
        {
          id: 'unqualified',
          value: 20,
          label: 'Unqualified',
          to: '/leads/unqualified',
        },
        {
          id: 'proposal',
          value: 15,
          label: 'Proposal',
          to: '/leads/proposal',
        },
        {
          id: 'negotiation',
          value: 5,
          label: 'Negotiation',
          to: '/leads/negotiation',
        },
      ],
    },
  },
  {
    id: 'widget-4',
    type: 'GRAPH',
    graphType: 'bar',
    title: 'Monthly Performance',
    data: {
      items: [
        {
          month: 'Jan',
          sales: 120,
          leads: 45,
          conversions: 12,
          to: '/metrics/january',
        },
        {
          month: 'Feb',
          sales: 150,
          leads: 52,
          conversions: 15,
          to: '/metrics/february',
        },
        {
          month: 'Mar',
          sales: 180,
          leads: 48,
          conversions: 18,
          to: '/metrics/march',
        },
        {
          month: 'Apr',
          sales: 140,
          leads: 60,
          conversions: 14,
          to: '/metrics/april',
        },
        {
          month: 'May',
          sales: 200,
          leads: 55,
          conversions: 20,
          to: '/metrics/may',
        },
      ],
      indexBy: 'month',
      keys: ['sales', 'leads', 'conversions'],
      showLegend: true,
      showGrid: true,
      displayType: 'number',
      xAxisLabel: 'Month',
      yAxisLabel: 'Count',
    },
  },
];

export const mockLayouts: Layouts = {
  desktop: [
    {
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      i: 'widget-2',
      x: 6,
      y: 0,
      w: 3,
      h: 5,
    },
    {
      i: 'widget-3',
      x: 0,
      y: 2,
      w: 6,
      h: 5,
    },
    {
      i: 'widget-4',
      x: 9,
      y: 0,
      w: 4,
      h: 8,
    },
  ],
  mobile: [
    {
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 1,
      h: 2,
    },
    {
      i: 'widget-2',
      x: 0,
      y: 2,
      w: 1,
      h: 5,
    },
    {
      i: 'widget-3',
      x: 0,
      y: 7,
      w: 1,
      h: 5,
    },
    {
      i: 'widget-4',
      x: 0,
      y: 12,
      w: 1,
      h: 5,
    },
  ],
};
