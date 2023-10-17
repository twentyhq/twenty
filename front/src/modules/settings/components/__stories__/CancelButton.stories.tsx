import { Meta, StoryObj } from '@storybook/react';

import { CancelButton } from '../SaveAndCancelButtons/CancelButton';

const meta: Meta<typeof CancelButton> = {
  title: 'Modules/Settings/CancelButton',
  component: CancelButton,
};

export default meta;
type Story = StoryObj<typeof CancelButton>;

export const Default: Story = {
  argTypes: {
    onCancel: { control: false },
  },
  args: {
    onCancel: () => {},
  },
};
