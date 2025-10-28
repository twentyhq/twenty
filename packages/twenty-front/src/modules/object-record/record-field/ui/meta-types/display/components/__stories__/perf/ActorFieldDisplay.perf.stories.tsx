import { ActorFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ActorFieldDisplay';
import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'twenty-ui/testing';
import { AuthContextDecorator } from '~/testing/decorators/AuthContextDecorator';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/ActorFieldDisplay',
  decorators: [
    AuthContextDecorator,
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
