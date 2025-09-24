import { type Layouts } from 'react-grid-layout';
import { type PageLayoutWidget } from '~/generated/graphql';

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

export const mockPageLayoutWidgets: PageLayoutWidget[] = [
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
