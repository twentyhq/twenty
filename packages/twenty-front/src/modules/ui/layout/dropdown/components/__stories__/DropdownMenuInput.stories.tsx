import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DropdownMenuInput } from '../DropdownMenuInput';

const meta: Meta<typeof DropdownMenuInput> = {
  title: 'UI/Layout/Dropdown/DropdownMenuInput',
  component: DropdownMenuInput,
  decorators: [ComponentDecorator],
  args: { value: 'Lorem ipsum' },
};

export default meta;
type Story = StoryObj<typeof DropdownMenuInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};
