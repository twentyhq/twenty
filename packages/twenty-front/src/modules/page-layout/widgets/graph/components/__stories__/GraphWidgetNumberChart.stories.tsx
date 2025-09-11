import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetNumberChart } from '../GraphWidgetNumberChart';

const meta: Meta<typeof GraphWidgetNumberChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetNumberChart',
  component: GraphWidgetNumberChart,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof GraphWidgetNumberChart>;

export const Default: Story = {
  args: {
    value: '1,234',
    trendPercentage: 12.5,
  },
};

export const NegativeTrend: Story = {
  args: {
    value: '892',
    trendPercentage: -8.3,
  },
};

export const PositiveTrend: Story = {
  args: {
    value: '5,678',
    trendPercentage: 24.7,
  },
};

export const ZeroTrend: Story = {
  args: {
    value: '3,456',
    trendPercentage: 0,
  },
};

export const LargeValue: Story = {
  args: {
    value: '1,234,567',
    trendPercentage: 15.2,
  },
};

export const SmallValue: Story = {
  args: {
    value: '42.75',
    trendPercentage: 3.1,
  },
};

export const LargePositiveChange: Story = {
  args: {
    value: '10,000',
    trendPercentage: 150,
  },
};

export const LargeNegativeChange: Story = {
  args: {
    value: '250',
    trendPercentage: -75,
  },
};
