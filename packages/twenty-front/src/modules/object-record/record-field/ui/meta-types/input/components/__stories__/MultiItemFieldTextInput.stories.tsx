import { expect, fn, userEvent, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof MultiItemFieldTextInput> = {
  title: 'UI/Data/Field/Input/MultiItemFieldTextInput',
  component: MultiItemFieldTextInput,
  decorators: [ComponentDecorator],
  args: { value: 'Lorem ipsum', onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof MultiItemFieldTextInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};

export const Invalid: Story = {
  args: {
    hasError: true,
    onEnter: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(getComputedStyle(input).borderWidth).toBe('0px');
    await expect(getComputedStyle(input).outlineWidth).toBe('2px');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    await expect(args.onEnter).toHaveBeenCalledTimes(1);
  },
};
