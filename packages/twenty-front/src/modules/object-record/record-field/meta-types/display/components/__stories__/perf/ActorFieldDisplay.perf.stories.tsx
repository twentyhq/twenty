import { ActorFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ActorFieldDisplay';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/ActorFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    getFieldDecorator('company', 'createdBy', {
      id: '1',
      name: 'John Doe',
    }),
    ComponentDecorator,
  ],
  component: ActorFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof ActorFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'ActorFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
