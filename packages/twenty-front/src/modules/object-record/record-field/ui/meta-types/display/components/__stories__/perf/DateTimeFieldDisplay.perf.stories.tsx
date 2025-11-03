import { type Meta, type StoryObj } from '@storybook/react';

import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { DateTimeFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/DateTimeFieldDisplay';
import { UserContext } from '@/users/contexts/UserContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/DateTimeFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'createdAt'),
    ComponentDecorator,
    (Story) => {
      return (
        <UserContext.Provider
          value={{
            dateFormat: DateFormat.SYSTEM,
            timeFormat: TimeFormat.SYSTEM,
            timeZone: 'UTC',
          }}
        >
          <Story />
        </UserContext.Provider>
      );
    },
  ],
  component: DateTimeFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof DateTimeFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'DateTimeFieldDisplay',
  averageThresholdInMs: 0.15,
  numberOfRuns: 30,
  numberOfTestsPerRun: 30,
});
