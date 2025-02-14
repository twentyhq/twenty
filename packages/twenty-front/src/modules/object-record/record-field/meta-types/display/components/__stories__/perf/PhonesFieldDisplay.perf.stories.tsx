import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { PhonesFieldDisplay } from '@/object-record/record-field/meta-types/display/components/PhonesFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/PhonesFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'phones'),
    ComponentDecorator,
    SnackBarDecorator,
  ],
  component: PhonesFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof PhonesFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const WrongNumber: Story = {
  decorators: [
    getFieldDecorator('person', 'phones', {
      primaryPhoneNumber: '123-456-7890',
      primaryPhoneCountryCode: '+1',
      additionalPhones: null,
    }),
  ],
};

export const Performance = getProfilingStory({
  componentName: 'PhonesFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
