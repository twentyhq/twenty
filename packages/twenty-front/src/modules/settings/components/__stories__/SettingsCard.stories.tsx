import { SettingsCard } from '@/settings/components/SettingsCard';
import { type Meta, type StoryObj } from '@storybook/react';
import React from 'react';
import { IconMailCog } from 'twenty-ui/display';
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
    onClick: () => {},
    Icon: React.createElement(IconMailCog),
    title: 'Settings Card',
  },
  argTypes: {
    className: { control: false },
    Icon: { control: false },
  },
};
