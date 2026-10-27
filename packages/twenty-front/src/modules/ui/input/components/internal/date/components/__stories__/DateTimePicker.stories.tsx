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
const MIDNIGHT_DATE = Temporal.ZonedDateTime.from(
  '2023-01-01T00:00:00+00:00[UTC]',
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
  isSelectedDateShown = false,
}: {
  instanceId?: string;
  initialDate?: Temporal.ZonedDateTime;
  timeZone?: string;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onClose?: (date: Temporal.ZonedDateTime | null) => void;
  isSelectedDateShown?: boolean;
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
      {isSelectedDateShown && <Text role="status">{date?.toString()}</Text>}
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
      await canvas.findByRole('gridcell', {
        name: /^Choose Sunday, January 15/,
      }),
    ).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Time' })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Select month and year' }),
    ).toBeVisible();
  },
};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Select month and year' }),
    );
    const panel = within(
      await body.findByRole('dialog', { name: 'Select month and year' }),
    );
    await userEvent.click(panel.getByText('January'));
    const options = await body.findByRole('listbox');
    await userEvent.click(
      within(options).getByRole('option', { name: 'February' }),
    );

    await expect(
      await canvas.findByRole('gridcell', {
        name: /^Choose Wednesday, February 15/,
      }),
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
      await canvas.findByRole('button', { name: 'Select month and year' }),
    );
    const panel = within(
      await body.findByRole('dialog', { name: 'Select month and year' }),
    );
    await userEvent.click(panel.getByText('2023'));
    const options = await body.findByRole('listbox');
    await userEvent.click(
      within(options).getByRole('option', { name: NEXT_YEAR_OPTION_LABEL }),
    );

    await expect(
      await canvas.findByRole('gridcell', {
        name: /^Choose Monday, January 15/,
      }),
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

export const SelectingTheSameDateWithTime: Story = {
  render: ({ onChange, onClose }) => (
    <DateTimePickerStory
      initialDate={ZONED_DATE}
      onChange={onChange}
      onClose={onClose}
      isSelectedDateShown
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: /^Choose Sunday, January 1st, 2023$/,
      }),
    );
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2023-01-01T02:15:00+00:00[UTC]',
    );
  },
};

export const SelectingTheSameDateAtMidnightOnlyCloses: Story = {
  render: ({ onChange, onClose }) => (
    <DateTimePickerStory
      initialDate={MIDNIGHT_DATE}
      onChange={onChange}
      onClose={onClose}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: /^Choose Sunday, January 1st, 2023$/,
      }),
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const PreservesTimeInTheSelectedTimezone: Story = {
  render: ({ onChange, onClose }) => (
    <DateTimePickerStory
      initialDate={ZONED_DATE}
      timeZone="America/Los_Angeles"
      onChange={onChange}
      onClose={onClose}
      isSelectedDateShown
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selectedDate = await canvas.findByRole('gridcell', {
      name: /^Choose Saturday, December 31/,
    });

    await expect(selectedDate).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(
      canvas.getByRole('gridcell', {
        name: /^Choose Friday, December 30/,
      }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        '2022-12-30T02:15:00-08:00[America/Los_Angeles]',
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
    const firstDate = await canvas.findByRole('gridcell', {
      name: /^Choose Thursday, December 1st, 2022$/,
    });
    const lastDate = canvas.getByRole('gridcell', {
      name: /^Choose Saturday, December 31/,
    });

    await expect(firstDate).toHaveAttribute('aria-selected', 'true');
    await expect(lastDate).toHaveAttribute('aria-selected', 'true');
    await expect(
      canvas.getByRole('rowgroup', { name: 'Month December, 2022' }),
    ).toHaveStyle({ pointerEvents: 'none', opacity: '0.5' });
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(
      await canvas.findByText('January 2023', {
        selector: 'span:not([role="alert"])',
      }),
    ).toBeVisible();
    const exclusiveEndDate = canvas.getByRole('gridcell', {
      name: /^Choose Sunday, January 1st, 2023$/,
    });
    await expect(exclusiveEndDate).toHaveAttribute('aria-selected', 'false');
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
      within(canvasElement).queryByRole('gridcell'),
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
    const [firstCalendarButton, secondCalendarButton] =
      await canvas.findAllByRole('button', { name: 'Select month and year' });

    await userEvent.click(firstCalendarButton);
    const panels = await body.findAllByRole('dialog', {
      name: 'Select month and year',
    });
    await expect(panels).toHaveLength(1);
    await expect(firstCalendarButton).toHaveAttribute('aria-expanded', 'true');
    await expect(secondCalendarButton).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await userEvent.click(within(panels[0]).getByText('January'));
    await expect(await body.findAllByRole('listbox')).toHaveLength(1);
  },
};
