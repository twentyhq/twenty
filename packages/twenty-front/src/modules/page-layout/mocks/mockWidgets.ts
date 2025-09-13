import { type Layouts } from 'react-grid-layout';
import { type PageLayoutWidgetWithData } from '../types/pageLayoutTypes';

export enum WidgetType {
  VIEW = 'VIEW',
  IFRAME = 'IFRAME',
  FIELDS = 'FIELDS',
  GRAPH = 'GRAPH',
}

export enum GraphType {
  NUMBER = 'NUMBER',
  GAUGE = 'GAUGE',
  PIE = 'PIE',
  BAR = 'BAR',
  LINE = 'LINE',
}

export const mockPageLayoutWidgets: PageLayoutWidgetWithData[] = [
  {
    id: 'widget-1',
    pageLayoutTabId: 'tab-overview',
    type: WidgetType.GRAPH,
    title: 'Sales Pipeline',
    objectMetadataId: null,
    gridPosition: {
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 3,
    },
    configuration: {
      graphType: GraphType.NUMBER,
    },
    data: {
      value: '1,234',
      trendPercentage: 12.5,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: 'widget-2',
    pageLayoutTabId: 'tab-overview',
    type: WidgetType.GRAPH,
    title: 'Conversion Rate',
    objectMetadataId: null,
    gridPosition: {
      row: 0,
      column: 6,
      rowSpan: 5,
      columnSpan: 3,
    },
    configuration: {
      graphType: GraphType.GAUGE,
    },
    data: {
      value: 0.5,
      min: 0,
      max: 1,
      label: 'Conversion rate',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: 'widget-3',
    pageLayoutTabId: 'tab-analytics',
    type: WidgetType.GRAPH,
    title: 'Lead Distribution',
    objectMetadataId: null,
    gridPosition: {
      row: 2,
      column: 0,
      rowSpan: 5,
      columnSpan: 6,
    },
    configuration: {
      graphType: GraphType.PIE,
    },
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: 'widget-4',
    pageLayoutTabId: 'tab-reports',
    type: WidgetType.GRAPH,
    title: 'Monthly Performance',
    objectMetadataId: null,
    gridPosition: {
      row: 0,
      column: 9,
      rowSpan: 8,
      columnSpan: 4,
    },
    configuration: {
      graphType: GraphType.BAR,
    },
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
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
