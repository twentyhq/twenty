import { Meta, StoryObj } from '@storybook/react';

import { SaveButton } from '../SaveAndCancelButtons/SaveButton';

const meta: Meta<typeof SaveButton> = {
  title: 'Modules/Settings/SaveButton',
  component: SaveButton,
};

export default meta;
type Story = StoryObj<typeof SaveButton>;

export const Default: Story = {
  argTypes: {
    onClick: { control: false },
  },
  args: {
    onClick: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  argTypes: {
    onClick: { control: false },
  },
  args: {
    onClick: () => {},
    disabled: true,
  },
};
