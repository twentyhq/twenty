import { type Meta, type StoryObj } from '@storybook/react';

import { RatingFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RatingFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/RatingFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'performanceRating'),
    ComponentDecorator,
  ],
  component: RatingFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof RatingFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'RatingFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 30,
  numberOfTestsPerRun: 30,
});
