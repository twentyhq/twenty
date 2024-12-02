import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormBooleanFieldInput } from '../FormBooleanFieldInput';

const meta: Meta<typeof FormBooleanFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormBooleanFieldInput',
  component: FormBooleanFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormBooleanFieldInput>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('False');
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Boolean',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Boolean');
  },
};

export const TrueByDefault: Story = {
  args: {
    defaultValue: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('True');
  },
};

export const FalseByDefault: Story = {
  args: {
    defaultValue: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('False');
  },
};
