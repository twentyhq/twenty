import { type Meta, type StoryObj } from '@storybook/react';

import { CurrencyFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/CurrencyFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/CurrencyFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'annualRecurringRevenue'),
    ComponentDecorator,
  ],
  component: CurrencyFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof CurrencyFieldDisplay>;

export const Default: Story = {};

export const Millions: Story = {
  decorators: [
    getFieldDecorator('company', 'annualRecurringRevenue', {
      __typename: 'Currency',
      amountMicros: 18200000 * 1000000,
      currencyCode: 'EUR',
    }),
  ],
};

export const Billions: Story = {
  decorators: [
    getFieldDecorator('company', 'annualRecurringRevenue', {
      __typename: 'Currency',
      amountMicros: 3230000000 * 1000000,
      currencyCode: 'USD',
    }),
  ],
};

export const Bazillions: Story = {
  decorators: [
    getFieldDecorator('company', 'annualRecurringRevenue', {
      __typename: 'Currency',
      amountMicros: 1e100,
      currencyCode: 'USD',
    }),
  ],
};

export const Performance = getProfilingStory({
  componentName: 'CurrencyFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
