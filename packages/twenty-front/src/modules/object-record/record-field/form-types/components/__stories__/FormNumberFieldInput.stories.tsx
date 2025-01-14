import { expect } from '@storybook/jest';
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

export const WithVariablePicker: Story = {
  args: {
    placeholder: 'Number field...',
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variablePicker = await canvas.findByText('VariablePicker');

    expect(variablePicker).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Number field...',
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
    defaultValue: 123,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByDisplayValue('123');

    expect(input).toBeDisabled();

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();
  },
};
