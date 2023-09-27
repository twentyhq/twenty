import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import * as icons from '@/ui/icon';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { IconPicker } from '../IconPicker';

const meta: Meta<typeof IconPicker> = {
  title: 'UI/Input/IconPicker',
  component: IconPicker,
  decorators: [ComponentDecorator],
  args: { icons },
  argTypes: {
    icons: { control: false },
    selectedIconKey: {
      options: Object.keys(icons),
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

export const Default: Story = {};

export const WithSelectedIcon: Story = {
  args: { selectedIconKey: 'IconCalendarEvent' },
};

export const WithSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const searchInput = canvas.getByRole('textbox');

    await userEvent.type(searchInput, 'Building skyscraper');

    const searchedIcon = canvas.getByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();
  },
};
