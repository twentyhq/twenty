import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { sleep } from '~/testing/sleep';

import { IconPicker } from '../IconPicker';

const meta: Meta<typeof IconPicker> = {
  title: 'UI/Input/IconPicker',
  component: IconPicker,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

export const Default: Story = {};

export const WithSelectedIcon: Story = {
  args: { selectedIconKey: 'IconCalendarEvent' },
};

export const WithOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const iconPickerButton = await canvas.findByRole('button');

    userEvent.click(iconPickerButton);
  },
};

export const WithOpenAndSelectedIcon: Story = {
  args: { selectedIconKey: 'IconCalendarEvent' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const iconPickerButton = await canvas.findByRole('button');

    userEvent.click(iconPickerButton);
  },
};

export const WithSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const iconPickerButton = await canvas.findByRole('button');

    userEvent.click(iconPickerButton);

    const searchInput = await canvas.findByRole('textbox');

    await userEvent.type(searchInput, 'Building skyscraper');

    await sleep(100);

    const searchedIcon = canvas.getByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();
  },
};

export const WithSearchAndClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const iconPickerButton = await canvas.findByRole('button');

    userEvent.click(iconPickerButton);

    let searchInput = await canvas.findByRole('textbox');

    await userEvent.type(searchInput, 'Building skyscraper');

    await sleep(100);

    const searchedIcon = canvas.getByRole('button', {
      name: 'Icon Building Skyscraper',
    });

    expect(searchedIcon).toBeInTheDocument();

    userEvent.click(searchedIcon);

    await sleep(100);

    userEvent.click(iconPickerButton);

    await sleep(100);

    searchInput = await canvas.findByRole('textbox');

    expect(searchInput).toHaveValue('');
  },
};
