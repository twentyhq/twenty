import { type Meta, type StoryObj } from '@storybook/react';

import { PhonesFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/PhonesFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/PhonesFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'phones'),
    ComponentDecorator,
    I18nFrontDecorator,
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
