import { type Layouts } from 'react-grid-layout';

export type WidgetType = 'number' | 'gauge' | 'pie' | 'view' | 'iframe';

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  data?: any;
};

export const mockWidgets: Widget[] = [
  {
    id: 'widget-1',
    type: 'number',
    title: 'Sales Pipeline',
    data: {
      value: '1,234',
      trendPercentage: 12.5,
    },
  },
  {
    id: 'widget-2',
    type: 'gauge',
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
    type: 'pie',
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
];

export const mockLayouts: Layouts = {
  lg: [
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
  ],
  md: [
    {
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      i: 'widget-2',
      x: 3,
      y: 0,
      w: 3,
      h: 5,
    },
    {
      i: 'widget-3',
      x: 6,
      y: 0,
      w: 6,
      h: 5,
    },
  ],
  sm: [
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
  ],
};
