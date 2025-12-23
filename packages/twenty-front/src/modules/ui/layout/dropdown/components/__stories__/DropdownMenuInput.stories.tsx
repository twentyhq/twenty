import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'twenty-ui/testing';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';

const meta: Meta<typeof DropdownMenuInput> = {
  title: 'UI/Layout/Dropdown/DropdownMenuInput',
  component: DropdownMenuInput,
  decorators: [ComponentDecorator],
  args: { value: 'Lorem ipsum', instanceId: 'dropdown-menu-input' },
};

export default meta;
type Story = StoryObj<typeof DropdownMenuInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};
