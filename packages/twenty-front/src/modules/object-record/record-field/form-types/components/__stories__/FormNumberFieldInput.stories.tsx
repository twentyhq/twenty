import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormNumberFieldInput } from '../FormNumberFieldInput';

const meta: Meta<typeof FormNumberFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormNumberFieldInput',
  component: FormNumberFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormNumberFieldInput>;

export const Default: Story = {
  args: {
    placeholder: 'Number field...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByPlaceholderText('Number field...');
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Number',
    placeholder: 'Number field...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Number');
    await canvas.findByPlaceholderText('Number field...');
  },
};
