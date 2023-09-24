import { expect } from '@storybook/jest';
import { type Meta, type StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DatePicker } from '../DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'UI/Input/DatePicker',
  component: DatePicker,
  decorators: [ComponentDecorator],
  argTypes: {
    date: { control: 'date' },
  },
  args: { date: new Date('January 1, 2023 00:00:00') },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const monthSelect = canvas.getByText('January');

    await userEvent.click(monthSelect);

    expect(canvas.getAllByText('January')).toHaveLength(2);
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
