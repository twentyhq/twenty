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
        dotColor: 'blue',
      },
    ],
    showClickHint: false,
  },
};

export const WithClickHint: Story = {
  args: {
    items: [
      {
        label: 'Sales',
        formattedValue: '1,234 units',
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
        label: 'Q1',
        formattedValue: '$12,345',
        dotColor: 'blue',
      },
      {
        label: 'Q2',
        formattedValue: '$23,456',
        dotColor: 'green',
      },
      {
        label: 'Q3',
        formattedValue: '$34,567',
        dotColor: 'red',
      },
    ],
    showClickHint: false,
  },
};
