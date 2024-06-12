import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { LinkFieldDisplay } from '@/object-record/record-field/meta-types/display/components/LinkFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/LinkFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'testLink'),
    ComponentDecorator,
  ],
  component: LinkFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof LinkFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'LinkFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
