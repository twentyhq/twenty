import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { RatingFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RatingFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
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
