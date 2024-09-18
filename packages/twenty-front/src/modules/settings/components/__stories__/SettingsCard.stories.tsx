import { SettingsCard } from '@/settings/components/SettingsCard';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ComponentDecorator, IconMailCog } from 'twenty-ui';

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
    className: { control: 'false' },
    Icon: { control: 'false' },
  },
};
