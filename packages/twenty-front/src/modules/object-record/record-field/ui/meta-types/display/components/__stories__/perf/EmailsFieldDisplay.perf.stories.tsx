import { type Meta, type StoryObj } from '@storybook/react';

import { EmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/EmailsFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/EmailsFieldDisplay',
  decorators: [
    I18nFrontDecorator,
    MemoryRouterDecorator,
    getFieldDecorator('person', 'emails', {
      primaryEmail: 'test@test.com',
      additionalEmails: ['toto@test.com'],
    }),
    ComponentDecorator,
    SnackBarDecorator,
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
