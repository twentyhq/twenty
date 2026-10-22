import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Temporal } from 'temporal-polyfill';
import { Field } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';

const INITIAL_DATE = Temporal.ZonedDateTime.from(
  '2023-01-01T02:00:00+00:00[UTC]',
);
const ZONED_DATE = Temporal.ZonedDateTime.from(
  '2023-01-01T02:15:30.123456789+00:00[UTC]',
);
const NEXT_YEAR_OPTION_LABEL = /^2024$/;

const RELATIVE_CALENDAR_RANGE = {
  direction: 'PAST' as const,
  amount: 1,
  unit: 'MONTH' as const,
  start: Temporal.ZonedDateTime.from('2022-12-01T00:00:00+00:00[UTC]'),
  end: Temporal.ZonedDateTime.from('2023-01-01T00:00:00+00:00[UTC]'),
};

const RELATIVE_SUB_DAY_RANGE = {
  direction: 'PAST' as const,
  amount: 3,
  unit: 'HOUR' as const,
  start: Temporal.ZonedDateTime.from('2023-01-01T00:00:00+00:00[UTC]'),
  end: Temporal.ZonedDateTime.from('2023-01-01T03:00:00+00:00[UTC]'),
};

const DateTimePickerStory = ({
  instanceId = 'story-date-time-picker',
  initialDate = INITIAL_DATE,
  timeZone = 'UTC',
  onChange,
  onClose,
  showSelectedDate = false,
}: {
  instanceId?: string;
  initialDate?: Temporal.ZonedDateTime;
  timeZone?: string;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onClose?: (date: Temporal.ZonedDateTime | null) => void;
  showSelectedDate?: boolean;
}) => {
  const [date, setDate] = useState<Temporal.ZonedDateTime | null>(initialDate);

  return (
    <>
      <DateTimePicker
        instanceId={instanceId}
        date={date}
        timeZone={timeZone}
        onChange={(nextDate) => {
          setDate(nextDate);
          onChange?.(nextDate);
        }}
        onClose={onClose}
      />
      {showSelectedDate && <Text role="status">{date?.toString()}</Text>}
    </>
  );
};

const meta: Meta<typeof DateTimePicker> = {
  title: 'UI/Input/Internal/Date/DateTimePicker',
  component: DateTimePicker,
  decorators: [ComponentDecorator],
  args: { onChange: fn(), onClose: fn() },
  render: ({ onChange, onClose }) => (
    <DateTimePickerStory onChange={onChange} onClose={onClose} />
  ),
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('grid', { name: 'January 2023' }),
    ).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Time' })).toBeVisible();
  },
};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Month' }),
    );
    const options = await body.findByRole('listbox');
    await userEvent.click(
      within(options).getByRole('option', { name: 'February' }),
    );

    await expect(
      canvas.getByRole('grid', { name: 'February 2023' }),
    ).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const WithOpenYearSelect: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Year' }),
    );
    const options = await body.findByRole('listbox');
    await userEvent.click(
      within(options).getByRole('option', { name: NEXT_YEAR_OPTION_LABEL }),
    );

    await expect(
      canvas.getByRole('grid', { name: 'January 2024' }),
    ).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const WithTimeInput: Story = {
  render: () => (
    <Field.Root>
      <Field.Label>Due date</Field.Label>
      <DateTimePickerStory />
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('textbox', { name: 'Time' }),
    ).toBeVisible();
  },
};

export const PreservesTimeInTheSelectedTimezone: Story = {
  render: ({ onChange, onClose }) => (
    <DateTimePickerStory
      initialDate={ZONED_DATE}
      timeZone="America/Los_Angeles"
      onChange={onChange}
      onClose={onClose}
      showSelectedDate
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = await canvas.findByRole('grid', { name: 'December 2022' });
    const selectedDate = within(grid).getByRole('button', {
      name: 'Saturday, December 31, 2022',
    });

    await expect(selectedDate.closest('td')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(
      within(grid).getByRole('button', { name: 'Friday, December 30, 2022' }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        '2022-12-30T18:15:30.123456789-08:00[America/Los_Angeles]',
      ),
    );
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const RelativeWithCalendarRange: Story = {
  render: ({ onChange }) => (
    <DateTimePicker
      instanceId="story-relative-date-time-picker"
      date={null}
      isRelative
      timeZone="UTC"
      relativeDate={RELATIVE_CALENDAR_RANGE}
      onChange={onChange}
      onRelativeDateChange={() => {}}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = await canvas.findByRole('grid', { name: 'December 2022' });
    const firstDate = within(grid).getByRole('button', {
      name: 'Thursday, December 1, 2022',
    });
    const lastDate = within(grid).getByRole('button', {
      name: 'Saturday, December 31, 2022',
    });

    await expect(firstDate.closest('td')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(lastDate.closest('td')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(firstDate);
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    const nextGrid = canvas.getByRole('grid', { name: 'January 2023' });
    const exclusiveEndDate = within(nextGrid).getByRole('button', {
      name: 'Sunday, January 1, 2023',
    });
    await expect(exclusiveEndDate.closest('td')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const RelativeWithSubDayText: Story = {
  render: () => (
    <DateTimePicker
      instanceId="story-relative-sub-day-picker"
      date={null}
      isRelative
      timeZone="UTC"
      relativeDate={RELATIVE_SUB_DAY_RANGE}
      onChange={() => {}}
      onRelativeDateChange={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('grid'),
    ).not.toBeInTheDocument();
  },
};

export const OpensOnlyItsOwnMonthSelect: Story = {
  render: () => (
    <>
      <DateTimePickerStory instanceId="first-date-time-picker" />
      <DateTimePickerStory instanceId="second-date-time-picker" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [firstMonthSelect, secondMonthSelect] = await canvas.findAllByRole(
      'combobox',
      { name: 'Month' },
    );

    await userEvent.click(firstMonthSelect);
    await expect(await body.findAllByRole('listbox')).toHaveLength(1);
    await expect(firstMonthSelect).toHaveAttribute('aria-expanded', 'true');
    await expect(secondMonthSelect).toHaveAttribute('aria-expanded', 'false');
  },
};
