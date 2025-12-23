import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';

const meta: Meta<typeof GraphWidgetTooltip> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetTooltip',
  component: GraphWidgetTooltip,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetTooltip>;

export const Default: Story = {
  args: {
    items: [
      {
        key: 'revenue',
        label: 'Revenue',
        formattedValue: '$45,231',
        value: 45231,
        dotColor: 'blue',
      },
    ],
    indexLabel: 'March 09, 2024',
  },
};

export const WithClickHint: Story = {
  args: {
    items: [
      {
        key: 'sales',
        label: 'Sales',
        formattedValue: '1,234 units',
        value: 1234,
        dotColor: 'green',
      },
    ],
    onGraphWidgetTooltipClick: () => {},
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        key: 'lastYear',
        label: 'Last year',
        formattedValue: '20k',
        value: 20000,
        dotColor: 'blue',
      },
      {
        key: 'thisYear',
        label: 'This year',
        formattedValue: '20k',
        value: 20000,
        dotColor: 'purple',
      },
    ],
    indexLabel: 'February 2',
  },
};

export const SuperLongText: Story = {
  args: {
    items: [
      {
        key: 'arr',
        label:
          'Total Annual Recurring Revenue (North America Region including Canada)',
        formattedValue: '$2,450,000',
        value: 2450000,
        dotColor: 'blue',
      },
      {
        key: 'cac',
        label: 'Customer Acquisition Cost (Marketing & Sales Combined)',
        formattedValue: '$125,500',
        value: 125500,
        dotColor: 'purple',
      },
    ],
    indexLabel:
      'Q4 2024 Financial Year End (October - December) - North America Regional Performance Summary',
  },
};

export const WithZeroValues: Story = {
  args: {
    items: [
      {
        key: 'revenue',
        label: 'Revenue',
        formattedValue: '$0.00',
        value: 0,
        dotColor: 'blue',
      },
      {
        key: 'sales',
        label: 'Sales',
        formattedValue: '0%',
        value: 0,
        dotColor: 'green',
      },
      {
        key: 'activeUsers',
        label: 'Active Users',
        formattedValue: '0',
        value: 0,
        dotColor: 'purple',
      },
      {
        key: 'conversions',
        label: 'Conversions',
        formattedValue: '$45,231',
        value: 45231,
        dotColor: 'orange',
      },
    ],
    indexLabel: 'March 09, 2024',
  },
};

export const ManyItemsWithScroll: Story = {
  args: {
    items: [
      {
        key: 'january',
        label: 'January',
        formattedValue: '$12,450',
        value: 12450,
        dotColor: 'blue',
      },
      {
        key: 'february',
        label: 'February',
        formattedValue: '$15,230',
        value: 15230,
        dotColor: 'green',
      },
      {
        key: 'march',
        label: 'March',
        formattedValue: '$18,920',
        value: 18920,
        dotColor: 'purple',
      },
      {
        key: 'april',
        label: 'April',
        formattedValue: '$14,560',
        value: 14560,
        dotColor: 'orange',
      },
      {
        key: 'may',
        label: 'May',
        formattedValue: '$21,340',
        value: 21340,
        dotColor: 'red',
      },
      {
        key: 'june',
        label: 'June',
        formattedValue: '$19,780',
        value: 19780,
        dotColor: 'pink',
      },
      {
        key: 'july',
        label: 'July',
        formattedValue: '$23,150',
        value: 23150,
        dotColor: 'yellow',
      },
      {
        key: 'august',
        label: 'August',
        formattedValue: '$20,890',
        value: 20890,
        dotColor: 'cyan',
      },
      {
        key: 'september',
        label: 'September',
        formattedValue: '$25,670',
        value: 25670,
        dotColor: 'teal',
      },
      {
        key: 'october',
        label: 'October',
        formattedValue: '$22,340',
        value: 22340,
        dotColor: 'indigo',
      },
      {
        key: 'november',
        label: 'November',
        formattedValue: '$27,890',
        value: 27890,
        dotColor: 'violet',
      },
      {
        key: 'december',
        label: 'December',
        formattedValue: '$31,220',
        value: 31220,
        dotColor: 'lime',
      },
    ],
    onGraphWidgetTooltipClick: () => {},
    indexLabel: 'Annual Report 2024',
  },
};
