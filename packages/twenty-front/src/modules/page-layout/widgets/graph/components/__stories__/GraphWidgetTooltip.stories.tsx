import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetTooltip } from '../GraphWidgetTooltip';

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
        label: 'Revenue',
        formattedValue: '$45,231',
        value: 45231,
        dotColor: 'blue',
      },
    ],
    showClickHint: false,
    indexLabel: 'March 09, 2024',
  },
};

export const WithClickHint: Story = {
  args: {
    items: [
      {
        label: 'Sales',
        formattedValue: '1,234 units',
        value: 1234,
        dotColor: 'green',
      },
    ],
    showClickHint: true,
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        label: 'Last year',
        formattedValue: '20k',
        value: 20000,
        dotColor: 'blue',
      },
      {
        label: 'This year',
        formattedValue: '20k',
        value: 20000,
        dotColor: 'purple',
      },
    ],
    showClickHint: true,
    indexLabel: 'February 2',
  },
};

export const SuperLongText: Story = {
  args: {
    items: [
      {
        label:
          'Total Annual Recurring Revenue (North America Region including Canada)',
        formattedValue: '$2,450,000',
        value: 2450000,
        dotColor: 'blue',
      },
      {
        label: 'Customer Acquisition Cost (Marketing & Sales Combined)',
        formattedValue: '$125,500',
        value: 125500,
        dotColor: 'purple',
      },
    ],
    showClickHint: true,
    indexLabel:
      'Q4 2024 Financial Year End (October - December) - North America Regional Performance Summary',
  },
};

export const WithZeroValues: Story = {
  args: {
    items: [
      {
        label: 'Revenue',
        formattedValue: '$0.00',
        value: 0,
        dotColor: 'blue',
      },
      {
        label: 'Sales',
        formattedValue: '0%',
        value: 0,
        dotColor: 'green',
      },
      {
        label: 'Active Users',
        formattedValue: '0',
        value: 0,
        dotColor: 'purple',
      },
      {
        label: 'Conversions',
        formattedValue: '$45,231',
        value: 45231,
        dotColor: 'orange',
      },
    ],
    showClickHint: false,
    indexLabel: 'March 09, 2024',
  },
};
