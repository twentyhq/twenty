import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { PhoneFieldDisplay } from '@/object-record/record-field/meta-types/display/components/PhoneFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/PhoneFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'phone'),
    ComponentDecorator,
  ],
  component: PhoneFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof PhoneFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const WrongNumber: Story = {
  decorators: [getFieldDecorator('person', 'phone', 'sdklaskdj')],
};

export const Performance = getProfilingStory({
  componentName: 'PhoneFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
