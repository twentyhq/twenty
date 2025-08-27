import { type Meta, type StoryObj } from '@storybook/react';

import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'UI/Input/EllipsisDisplay/EllipsisDisplay',
  component: EllipsisDisplay,
  decorators: [ComponentDecorator],
  args: {
    maxWidth: 100,
    children: 'This is a long text that should be truncated',
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof EllipsisDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'EllipsisDisplay',
  averageThresholdInMs: 0.1,
  numberOfRuns: 20,
  numberOfTestsPerRun: 10,
});
