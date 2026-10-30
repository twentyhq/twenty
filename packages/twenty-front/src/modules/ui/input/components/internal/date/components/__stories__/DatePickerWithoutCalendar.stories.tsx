import { DatePickerWithoutCalendar } from '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const INITIAL_PLAIN_DATE = '2023-01-01';

const DatePickerWithoutCalendarStory = ({
  instanceId = 'story-date-picker-without-calendar',
}: {
  instanceId?: string;
}) => {
  const [date, setDate] = useState<string | null>(INITIAL_PLAIN_DATE);

  return (
    <DatePickerWithoutCalendar
      instanceId={instanceId}
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
    const monthSelect = await canvas.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    expect(monthSelect).toBeInTheDocument();
  },
};

export const OpensOnlyItsOwnYearSelect: Story = {
  render: () => (
    <>
      <DatePickerWithoutCalendarStory instanceId="first-date-picker-without-calendar" />
      <DatePickerWithoutCalendarStory instanceId="second-date-picker-without-calendar" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [firstYearSelect] = await canvas.findAllByText(
      '2023',
      {},
      { timeout: 10000 },
    );

    await userEvent.click(firstYearSelect);

    await waitFor(() => {
      expect(body.getAllByRole('listbox')).toHaveLength(1);
    });
  },
};

export const ChangesMonthWithoutShowingDays: Story = {
  args: { date: '2023-01-31', onChange: fn() },
  render: ({ date, onChange }) => (
    <DatePickerWithoutCalendar
      date={date}
      onChange={onChange}
      instanceId="month-only"
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('gridcell')).not.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Next' }));
    expect(args.onChange).toHaveBeenCalledWith('2023-02-28');
  },
};

export const KeepsEmptySelection: Story = {
  args: { date: null, onChange: fn() },
  render: ({ date, onChange }) => (
    <DatePickerWithoutCalendar
      date={date}
      onChange={onChange}
      instanceId="empty-month-only"
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Next' }));
    expect(args.onChange).toHaveBeenCalledWith(null);
  },
};
