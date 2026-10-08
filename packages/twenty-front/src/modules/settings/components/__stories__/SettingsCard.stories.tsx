import { SettingsCard } from '@/settings/components/SettingsCard';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconMailCog } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsCard> = {
  title: 'Modules/Settings/SettingsCard',
  component: SettingsCard,
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj<typeof SettingsCard>;

export const Default: Story = {
  args: {
    onClick: fn(),
    Icon: React.createElement(IconMailCog),
    title: 'Settings Card',
  },
  argTypes: {
    className: { control: false },
    Icon: { control: false },
  },
  play: async ({ canvasElement, args }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Settings Card',
    });

    action.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
  play: async ({ canvasElement, args }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Settings Card',
    });

    await expect(action).toBeDisabled();
    await userEvent.click(action);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
