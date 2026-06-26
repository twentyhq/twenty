import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { type RelativeDateFilter } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

const INITIAL_PLAIN_DATE = '2023-01-01';

const RELATIVE_DATE: RelativeDateFilter & { start: string; end: string } = {
  direction: 'PAST',
  amount: 7,
  unit: 'DAY',
  start: '2022-12-25',
  end: '2023-01-01',
};

const DatePickerStory = ({
  isRelative,
  clearable,
}: {
  isRelative?: boolean;
  clearable?: boolean;
}) => {
  const [plainDateString, setPlainDateString] = useState<string | null>(
    INITIAL_PLAIN_DATE,
  );

  return (
    <DatePicker
      instanceId="story-date-picker"
      plainDateString={plainDateString}
      onChange={setPlainDateString}
      clearable={clearable}
      isRelative={isRelative}
      relativeDate={isRelative ? RELATIVE_DATE : undefined}
    />
  );
};

const meta: Meta<typeof DatePicker> = {
  title: 'UI/Input/Internal/Date/DatePicker',
  component: DatePicker,
  decorators: [ComponentDecorator],
  render: () => <DatePickerStory />,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Lazy-loaded react-datepicker renders the day grid; wait for a day cell.
    await canvas.findByText('15', {}, { timeout: 10000 });
  },
};

export const NotClearable: Story = {
  render: () => <DatePickerStory clearable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('15', {}, { timeout: 10000 });
    expect(canvas.queryByText('Clear')).not.toBeInTheDocument();
  },
};

export const Relative: Story = {
  render: () => <DatePickerStory isRelative />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('15', {}, { timeout: 10000 });
  },
};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const monthSelect = await canvas.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(monthSelect);

    for (const monthLabel of ['February', 'June', 'December']) {
      expect(await body.findByText(monthLabel)).toBeInTheDocument();
    }
  },
};

export const WithOpenYearSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const yearSelect = await canvas.findByText('2023', {}, { timeout: 10000 });
    await userEvent.click(yearSelect);

    for (const yearLabel of ['2022', '2024']) {
      expect(await body.findByText(yearLabel)).toBeInTheDocument();
    }
  },
};
