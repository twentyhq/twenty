import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';
import { InternalDatePicker } from '../InternalDatePicker';

const meta: Meta<typeof InternalDatePicker> = {
  title: 'UI/Input/Internal/InternalDatePicker',
  component: InternalDatePicker,
  decorators: [ComponentDecorator],
  argTypes: {
    date: { control: 'date' },
  },
  render: ({ date }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, updateArgs] = useArgs();
    return (
      <InternalDatePicker
        date={isDefined(date) ? new Date(date) : new Date()}
        onChange={(newDate) => updateArgs({ date: newDate })}
      />
    );
  },
  args: { date: new Date('January 1, 2023 02:00:00') },
};

export default meta;
type Story = StoryObj<typeof InternalDatePicker>;

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
    ].forEach((monthLabel) =>
      expect(canvas.getByText(monthLabel)).toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByText('February'));

    expect(canvas.getByText('February')).toBeInTheDocument();
  },
};

export const WithOpenYearSelect: Story = {
  play: async () => {
    const canvas = within(document.body);

    const yearSelect = await canvas.findByText('2023');

    await userEvent.click(yearSelect);

    ['2024', '2025', '2026'].forEach((yearLabel) =>
      expect(canvas.getByText(yearLabel)).toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByText('2024'));

    expect(canvas.getByText('2024')).toBeInTheDocument();
  },
};
