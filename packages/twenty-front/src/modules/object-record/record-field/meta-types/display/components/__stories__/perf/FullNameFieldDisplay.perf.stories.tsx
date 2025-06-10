import { Meta, StoryObj } from '@storybook/react';

import { FullNameFieldDisplay } from '@/object-record/record-field/meta-types/display/components/FullNameFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta = {
  title: 'UI/Data/Field/Display/FullNameFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'name'),
    ComponentDecorator,
  ],
  component: FullNameFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof FullNameFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'FullNameFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
