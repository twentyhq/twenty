import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TextInput } from '@/ui/input/components/TextInput';
import { type TextInputComponentProps } from '@/ui/input/types/TextInputComponentProps';
import { ComponentDecorator } from 'twenty-ui/testing';

type RenderProps = TextInputComponentProps;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (text: string) => {
    args.onChange?.(text);
    setValue(text);
  };

  // oxlint-disable-next-line react/jsx-props-no-spreading
  return <TextInput {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof TextInput> = {
  title: 'UI/Input/TextInput',
  component: TextInput,
  decorators: [ComponentDecorator],
  args: { placeholder: 'Tim' },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: 'Tim' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Tim' },
};

export const AutoGrow: Story = {
  args: { autoGrow: true, value: 'Tim' },
};

export const AutoGrowWithPlaceholder: Story = {
  args: { autoGrow: true, placeholder: 'Tim' },
};

export const Small: Story = {
  args: { sizeVariant: 'sm', value: 'Tim' },
};

export const AutoGrowSmall: Story = {
  args: { autoGrow: true, sizeVariant: 'sm', value: 'Tim' },
};

export const WithLeftAdornment: Story = {
  args: {
    leftAdornment: 'https://',
  },
};

export const WithRightAdornment: Story = {
  args: {
    rightAdornment: '@twenty.com',
  },
};

export const ForwardsNativeInputProps: Story = {
  args: {
    label: 'Address',
    value: '',
    onChange: fn(),
    onFocus: fn(),
    onKeyDown: fn(),
    inputProps: {
      id: 'native-address-input',
      role: 'combobox',
      'aria-controls': 'address-options',
      onChange: fn(),
      onFocus: fn(),
      onKeyDown: fn(),
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Address' });

    expect(input).toHaveAttribute('id', 'native-address-input');
    expect(input).toHaveAttribute('aria-controls', 'address-options');

    await userEvent.click(canvas.getByText('Address'));

    expect(input).toHaveFocus();
    expect(args.onFocus).toHaveBeenCalledTimes(1);
    expect(args.inputProps?.onFocus).toHaveBeenCalledTimes(1);

    await userEvent.type(input, 'Paris');

    expect(input).toHaveValue('Paris');
    expect(args.onChange).toHaveBeenLastCalledWith('Paris');
    expect(args.inputProps?.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: input }),
    );
    expect(args.onKeyDown).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 's' }),
    );
    expect(args.inputProps?.onKeyDown).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 's' }),
    );
  },
};
