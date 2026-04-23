import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Temporal } from 'temporal-polyfill';
import { ComponentDecorator } from 'twenty-ui/testing';

const INITIAL_DATE = Temporal.ZonedDateTime.from(
  '2023-01-01T02:00:00+00:00[UTC]',
);

const DateTimePickerStory = () => {
  const [date, setDate] = useState<Temporal.ZonedDateTime | null>(INITIAL_DATE);

  return (
    <DateTimePicker
      instanceId="story-date-time-picker"
      date={date}
      onChange={setDate}
    />
  );
};

const meta: Meta<typeof DateTimePicker> = {
  title: 'UI/Input/Internal/InternalDatePicker',
  component: DateTimePicker,
  decorators: [ComponentDecorator],
  render: () => <DateTimePickerStory />,
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // Wait for date picker to load and click calendar icon to open month/year selector
    const calendarButton = await canvas.findByRole(
      'button',
      { name: 'Select month and year' },
      { timeout: 10000 },
    );
    await userEvent.click(calendarButton);

    // Now find and click the month select
    const monthSelect = await body.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(monthSelect);

    for (const monthLabel of [
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]) {
      expect(await body.findByText(monthLabel)).toBeInTheDocument();
    }

    await userEvent.click(await body.findByText('February'));

    expect(await body.findByText('February')).toBeInTheDocument();
  },
};

export const WithOpenYearSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // Wait for date picker to load and click calendar icon to open month/year selector
    const calendarButton = await canvas.findByRole(
      'button',
      { name: 'Select month and year' },
      { timeout: 10000 },
    );
    await userEvent.click(calendarButton);

    const yearSelect = await body.findByText('2023', {}, { timeout: 10000 });
    await userEvent.click(yearSelect);

    for (const yearLabel of ['2024', '2025', '2026']) {
      expect(await body.findByText(yearLabel)).toBeInTheDocument();
    }

    await userEvent.click(await body.findByText('2024'));

    expect(await body.findByText('2024')).toBeInTheDocument();
  },
};

export const WithTimeInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Increased timeout to account for lazy-loaded react-datepicker on slower CI runners
    const timeInput = await canvas.findByPlaceholderText(
      /HH:mm/,
      {},
      { timeout: 10000 },
    );

    expect(timeInput).toBeInTheDocument();
  },
};
