import { useArgs } from '@storybook/preview-api';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Temporal } from 'temporal-polyfill';
import { ComponentDecorator } from 'twenty-ui/testing';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'UI/Input/Internal/InternalDatePicker',
  component: DateTimePicker,
  decorators: [ComponentDecorator],
  argTypes: {
    date: { control: 'date' },
  },
  render: ({ date }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, updateArgs] = useArgs();
    return (
      <DateTimePicker
        instanceId="story-date-time-picker"
        date={date}
        onChange={(newDate) => updateArgs({ date: newDate })}
      />
    );
  },
  args: {
    date: Temporal.Instant.from('2023-01-01T02:00:00Z').toZonedDateTimeISO(
      'UTC',
    ),
  },
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {};

export const WithOpenMonthSelect: Story = {
  play: async () => {
    const canvas = within(document.body);

    const monthSelect = await canvas.findByText('January');

    await userEvent.click(monthSelect);

    [
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
    ].forEach(async (monthLabel) =>
      expect(await canvas.findByText(monthLabel)).toBeInTheDocument(),
    );

    await userEvent.click(await canvas.findByText('February'));

    expect(await canvas.findByText('February')).toBeInTheDocument();
  },
};

export const WithOpenYearSelect: Story = {
  play: async () => {
    const canvas = within(document.body);

    const yearSelect = await canvas.findByText('2023');

    await userEvent.click(yearSelect);

    ['2024', '2025', '2026'].forEach(async (yearLabel) =>
      expect(await canvas.findByText(yearLabel)).toBeInTheDocument(),
    );

    await userEvent.click(await canvas.findByText('2024'));

    expect(await canvas.findByText('2024')).toBeInTheDocument();
  },
};
