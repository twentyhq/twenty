import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DropdownMenuInput } from '../DropdownMenuInput';

const meta: Meta<typeof DropdownMenuInput> = {
  title: 'UI/Dropdown/DropdownMenuInput',
  component: DropdownMenuInput,
  decorators: [ComponentDecorator],
  args: { defaultValue: 'Lorem ipsum' },
  argTypes: {
    as: { table: { disable: true } },
    theme: { table: { disable: true } },
  },
  parameters: { options: { showPanel: true } },
};

export default meta;
type Story = StoryObj<typeof DropdownMenuInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};
