import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { InternalDatePicker } from '../InternalDatePicker';

const meta: Meta<typeof InternalDatePicker> = {
  title: 'UI/Input/Internal/InternalDatePicker',
  component: InternalDatePicker,
  decorators: [ComponentDecorator],
  argTypes: {
    date: { control: 'date' },
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
  },
};
