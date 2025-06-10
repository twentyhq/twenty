import { Meta, StoryObj } from '@storybook/react';

import { MultiItemBaseInput } from '../MultiItemBaseInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof MultiItemBaseInput> = {
  title: 'UI/Data/Field/Input/BaseFieldInput',
  component: MultiItemBaseInput,
  decorators: [ComponentDecorator],
  args: { value: 'Lorem ipsum' },
};

export default meta;
type Story = StoryObj<typeof MultiItemBaseInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};
