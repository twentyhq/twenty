import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { UserContext } from '@/users/contexts/UserContext';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

const meta: Meta<typeof DateDisplay> = {
  title: 'UI/Field/Display/DateDisplay',
  component: DateDisplay,
  decorators: [
    (Story) => (
      <UserContext.Provider
        value={{
          dateFormat: DateFormat.DAY_FIRST,
          timeFormat: TimeFormat.HOUR_24,
          timeZone: 'Pacific/Tahiti', // Needed for our test on time difference
        }}
      >
        <Story />
      </UserContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateDisplay>;

export const Default: Story = {
  args: {
    value: '2025-05-01T00:00:00.000Z',
    dateFieldSettings: {
      displayFormat: FieldDateDisplayFormat.USER_SETTINGS,
    },
  },
  play: async ({ canvasElement }) => {
    // Test that date is rightfully displayed and not converted to timeZone date which would be on April 30th
    const canvas = within(canvasElement);
    const dateElement = await canvas.findByText('1 May, 2025');
    expect(dateElement).toBeInTheDocument();
  },
};
