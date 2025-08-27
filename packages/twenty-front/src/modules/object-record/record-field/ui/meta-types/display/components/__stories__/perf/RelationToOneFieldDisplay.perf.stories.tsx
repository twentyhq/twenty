import { type Meta, type StoryObj } from '@storybook/react';

import { RelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RelationToOneFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/RelationFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    getFieldDecorator('person', 'company'),
    ComponentDecorator,
  ],
  component: RelationToOneFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof RelationToOneFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'RelationFieldDisplay',
  averageThresholdInMs: 0.22,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
