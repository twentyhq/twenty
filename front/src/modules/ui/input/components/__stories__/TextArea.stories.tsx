import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TextArea, TextAreaProps } from '../TextArea';

type RenderProps = TextAreaProps;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (text: string) => {
    args.onChange?.(text);
    setValue(text);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <TextArea {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof TextArea> = {
  title: 'UI/Input/TextArea',
  component: TextArea,
  decorators: [ComponentDecorator],
  args: { minRows: 4, placeholder: 'Lorem Ipsum' },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: 'Lorem Ipsum' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Lorem Ipsum' },
};
