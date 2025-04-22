import { Meta, StoryObj } from '@storybook/react';

import { NumberFieldDisplay } from '@/object-record/record-field/meta-types/display/components/NumberFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'UI/Data/Field/Display/NumberFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'employees'),
    ComponentDecorator,
  ],
  component: NumberFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof NumberFieldDisplay>;

export const Default: Story = {
  args: {
    value: 100,
  },
};

export const Elipsis: Story = {
  decorators: [getFieldDecorator('company', 'employees', 1e100)],
  parameters: {
    container: { width: 100 },
  },
};

export const Negative: Story = {
  decorators: [getFieldDecorator('company', 'employees', -1000)],
};

export const Float: Story = {
  decorators: [getFieldDecorator('company', 'employees', 3.14159)],
};

export const Performance = getProfilingStory({
  componentName: 'NumberFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
