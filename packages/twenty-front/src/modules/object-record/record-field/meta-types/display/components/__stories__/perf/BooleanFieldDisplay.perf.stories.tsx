import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { BooleanFieldDisplay } from '@/object-record/record-field/meta-types/display/components/BooleanFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
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
