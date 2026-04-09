import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CancelButton } from '@/settings/components/SaveAndCancelButtons/CancelButton';

const meta: Meta<typeof CancelButton> = {
  title: 'Modules/Settings/CancelButton',
  component: CancelButton,
  decorators: [],
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
