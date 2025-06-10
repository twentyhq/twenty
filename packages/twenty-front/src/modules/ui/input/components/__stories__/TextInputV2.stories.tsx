import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  TextInputV2,
  TextInputV2ComponentProps,
} from '@/ui/input/components/TextInputV2';
import { ComponentDecorator } from 'twenty-ui/testing';

type RenderProps = TextInputV2ComponentProps;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (text: string) => {
    args.onChange?.(text);
    setValue(text);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <TextInputV2 {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof TextInputV2> = {
  title: 'UI/Input/TextInputV2',
  component: TextInputV2,
  decorators: [ComponentDecorator],
  args: { placeholder: 'Tim' },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof TextInputV2>;

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
