import { DatePickerWithoutCalendar } from '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const INITIAL_PLAIN_DATE = '2023-01-01';

const DatePickerWithoutCalendarStory = () => {
  const [date, setDate] = useState<string | null>(INITIAL_PLAIN_DATE);

  return (
    <DatePickerWithoutCalendar
      instanceId="story-date-picker-without-calendar"
      date={date}
      onChange={setDate}
    />
  );
};

const meta: Meta<typeof DatePickerWithoutCalendar> = {
  title: 'UI/Input/Internal/Date/DatePickerWithoutCalendar',
  component: DatePickerWithoutCalendar,
  decorators: [ComponentDecorator],
  render: () => <DatePickerWithoutCalendarStory />,
};

export default meta;
type Story = StoryObj<typeof DatePickerWithoutCalendar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Calendar grid is hidden; only the month/year header should be present.
    const monthSelect = await canvas.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    expect(monthSelect).toBeInTheDocument();
  },
};
