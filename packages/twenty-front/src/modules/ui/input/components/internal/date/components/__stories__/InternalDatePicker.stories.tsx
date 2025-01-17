import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';
import { DateTimePicker } from '../InternalDatePicker';

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
        date={isDefined(date) ? new Date(date) : new Date()}
        onChange={(newDate) => updateArgs({ date: newDate })}
      />
    );
  },
  args: { date: new Date('January 1, 2023 02:00:00') },
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
