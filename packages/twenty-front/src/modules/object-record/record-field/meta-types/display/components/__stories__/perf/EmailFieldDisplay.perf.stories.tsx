import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { EmailFieldDisplay } from '@/object-record/record-field/meta-types/display/components/EmailFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/EmailFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'email'),
    ComponentDecorator,
  ],
  component: EmailFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof EmailFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
  decorators: [
    getFieldDecorator(
      'person',
      'email',
      'asdasdasdaksjdhkajshdkajhasmdkamskdsd@asdkjhaksjdhaksjd.com',
    ),
  ],
};

export const Performance = getProfilingStory({
  componentName: 'EmailFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
