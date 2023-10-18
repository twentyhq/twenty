import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TextInput, TextInputComponentProps } from '../TextInput';

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
