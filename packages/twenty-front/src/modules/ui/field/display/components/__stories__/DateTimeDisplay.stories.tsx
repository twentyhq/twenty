import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { UserContext } from '@/users/contexts/UserContext';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof DateTimeDisplay> = {
  title: 'UI/Field/Display/DateTimeDisplay',
  component: DateTimeDisplay,
  decorators: [
    (Story) => (
      <UserContext.Provider
        value={{
          dateFormat: DateFormat.DAY_FIRST,
          timeFormat: TimeFormat.HOUR_24,
          timeZone: 'Pacific/Tahiti', // Non-system time zone renders the timezone abbreviation
        }}
      >
        <Story />
      </UserContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateTimeDisplay>;

export const Default: Story = {
  args: {
    value: '2025-05-01T12:00:00.000Z',
    dateFieldSettings: {
      displayFormat: FieldDateDisplayFormat.USER_SETTINGS,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateElement = await canvas.findByText(/1 May, 2025/);
    expect(dateElement).toBeInTheDocument();
  },
};

// A date-time field can hold a date-only value (e.g. through imports or API
// writes). This used to throw in Temporal.Instant.from and crash the field.
export const DateOnlyValue: Story = {
  args: {
    value: '2026-05-07',
    dateFieldSettings: {
      displayFormat: FieldDateDisplayFormat.USER_SETTINGS,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateElement = await canvas.findByText(/2026/);
    expect(dateElement).toBeInTheDocument();
  },
};
