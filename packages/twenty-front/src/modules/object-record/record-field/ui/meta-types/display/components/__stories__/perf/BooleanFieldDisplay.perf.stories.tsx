import { type Meta, type StoryObj } from '@storybook/react';

import { BooleanFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/BooleanFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/BooleanFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'idealCustomerProfile'),
    ComponentDecorator,
  ],
  component: BooleanFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof BooleanFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'BooleanFieldDisplay',
  averageThresholdInMs: 0.15,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
