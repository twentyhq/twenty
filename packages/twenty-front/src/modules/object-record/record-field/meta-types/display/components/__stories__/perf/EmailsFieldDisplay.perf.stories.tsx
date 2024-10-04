import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { EmailsFieldDisplay } from '@/object-record/record-field/meta-types/display/components/EmailsFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/EmailsFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'emails', {
      primaryEmail: 'test@test.com',
      additionalEmails: ['toto@test.com'],
    }),
    ComponentDecorator,
  ],
  component: EmailsFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof EmailsFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 100 },
  },
  decorators: [
    getFieldDecorator('person', 'emails', {
      primaryEmail:
        'asdasdasdaksjdhkajshdkajhasmdkamskdsd@asdkjhaksjdhaksjd.com',
      additionalEmails: [],
    }),
  ],
};

export const Performance = getProfilingStory({
  componentName: 'EmailsFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
