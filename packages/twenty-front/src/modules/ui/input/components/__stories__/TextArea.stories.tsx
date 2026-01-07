import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';

import { expect, userEvent, within } from '@storybook/test';
import { TextArea, type TextAreaProps } from '@/ui/input/components/TextArea';
import { ComponentDecorator } from 'twenty-ui/testing';

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

export const WithLabel: Story = {
  args: { label: 'My Textarea' },
  play: async () => {
    const canvas = within(document.body);

    const label = await canvas.findByText('My Textarea');

    expect(label).toBeVisible();

    await userEvent.click(label);

    const input = await canvas.findByRole('textbox');

    expect(input).toHaveFocus();
  },
};
