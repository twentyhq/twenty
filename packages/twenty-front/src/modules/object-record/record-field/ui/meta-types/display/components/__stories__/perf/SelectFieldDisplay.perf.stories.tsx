import { type Meta, type StoryObj } from '@storybook/react';

import { SelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/SelectFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/SelectFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('task', 'status'),
    ComponentDecorator,
  ],
  component: SelectFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof SelectFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'SelectFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
