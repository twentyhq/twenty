import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextArea } from '@/ui/input/components/TextArea';
import { type TextAreaProps } from '@/ui/input/types/TextAreaProps';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

type RenderProps = TextAreaProps;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (text: string) => {
    args.onChange?.(text);
    setValue(text);
  };

  // oxlint-disable-next-line react/jsx-props-no-spreading
  return <TextArea {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof TextArea> = {
  title: 'UI/Input/TextArea',
  component: TextArea,
  decorators: [ComponentDecorator],
  args: { minRows: 4, maxRows: 5, placeholder: 'Lorem Ipsum' },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = await canvas.findByText('My Textarea');

    expect(label).toBeVisible();

    await userEvent.click(label);

    const input = await canvas.findByRole('textbox');

    expect(input).toHaveFocus();
  },
};

export const Transparent: Story = {
  args: {
    variant: 'transparent',
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox');

    await expect(textarea).toHaveAttribute('data-variant', 'plain');
    await expect(getComputedStyle(textarea).borderWidth).toBe('0px');
    await expect(getComputedStyle(textarea).padding).toBe('0px');
    const initialHeight = textarea.clientHeight;
    await userEvent.type(
      textarea,
      '{enter}Second{enter}Third{enter}Fourth{enter}Fifth{enter}Sixth',
    );
    await waitFor(() =>
      expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight),
    );
    await expect(textarea.clientHeight).toBeGreaterThanOrEqual(initialHeight);
  },
};

export const TransparentUnbounded: Story = {
  args: {
    variant: 'transparent',
    maxRows: undefined,
    value: Array.from({ length: 10 }, (_, index) => `Line ${index + 1}`).join(
      '\n',
    ),
  },
};
