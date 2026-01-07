import { type Meta, type StoryObj } from '@storybook/react';

import { SaveButton } from '@/settings/components/SaveAndCancelButtons/SaveButton';

const meta: Meta<typeof SaveButton> = {
  title: 'Modules/Settings/SaveButton',
  component: SaveButton,
};

export default meta;
type Story = StoryObj<typeof SaveButton>;

export const Default: Story = {
  argTypes: {
    onSave: { control: false },
  },
  args: {
    onSave: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  argTypes: {
    onSave: { control: false },
  },
  args: {
    onSave: () => {},
    disabled: true,
  },
};
