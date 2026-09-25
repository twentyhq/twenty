import { CalendarEventsDateInput } from '@/activities/calendar/components/CalendarEventsDateInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

type CalendarEventsDateInputStoryProps = {
  initialPlainDate?: string;
  onChange: (plainDate: string | undefined) => void;
};

const StatefulCalendarEventsDateInput = ({
  initialPlainDate,
  onChange,
}: CalendarEventsDateInputStoryProps) => {
  const [plainDate, setPlainDate] = useState(initialPlainDate);

  const handleChange = (newPlainDate: string | undefined) => {
    onChange(newPlainDate);
    setPlainDate(newPlainDate);
  };

  return (
    <CalendarEventsDateInput
      dropdownId="calendar-events-date-input"
      plainDate={plainDate}
      placeholder="Start date"
      onChange={handleChange}
    />
  );
};

const meta: Meta<typeof StatefulCalendarEventsDateInput> = {
  title: 'Modules/Activities/Calendar/CalendarEventsDateInput',
  component: StatefulCalendarEventsDateInput,
  decorators: [ComponentDecorator],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof StatefulCalendarEventsDateInput>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Start date')).toBeVisible();
  },
};

export const PicksADay: Story = {
  args: {
    initialPlainDate: '2026-03-10',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Mar 10, 2026'));
    await userEvent.click(await screen.findByText('17'));

    expect(args.onChange).toHaveBeenCalledWith('2026-03-17');
    expect(await canvas.findByText('Mar 17, 2026')).toBeVisible();
  },
};
