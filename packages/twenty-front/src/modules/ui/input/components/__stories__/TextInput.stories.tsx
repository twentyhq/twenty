import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  TextInput,
  TextInputComponentProps,
} from '@/ui/input/components/TextInput';
import { ComponentDecorator } from 'twenty-ui/testing';

type RenderProps = TextInputComponentProps;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (text: string) => {
    args.onChange?.(text);
    setValue(text);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
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
