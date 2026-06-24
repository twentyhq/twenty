import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  TextInput,
  type TextInputComponentProps,
} from '@/ui/input/components/TextInput';
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

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'not-an-email',
    error: 'Email is invalid',
  },
};

// The error message renders in normal flow and pushes the next field down
// instead of overlapping it (see PR #21886).
export const ErrorDoesNotOverlapNextField: Story = {
  args: {
    label: 'Email',
    value: 'not-an-email',
    error: 'Email is invalid',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
      <Render {...args} />
      <TextInput label="Password" placeholder="••••••••" />
    </div>
  ),
};
