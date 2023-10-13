import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { InternalDatePicker } from '../InternalDatePicker';

const meta: Meta<typeof InternalDatePicker> = {
  title: 'UI/Input/InternalDatePicker',
  component: InternalDatePicker,
  decorators: [ComponentDecorator],
  argTypes: {
    date: { control: 'date' },
  },
  args: { date: new Date('January 1, 2023 00:00:00') },
};

export default meta;
type Story = StoryObj<typeof InternalDatePicker>;

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
