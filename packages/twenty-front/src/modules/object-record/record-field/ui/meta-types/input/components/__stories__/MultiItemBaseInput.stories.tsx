import { expect, fn, userEvent, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { MultiItemBaseInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof MultiItemBaseInput> = {
  title: 'UI/Data/Field/Input/BaseFieldInput',
  component: MultiItemBaseInput,
  decorators: [ComponentDecorator],
  args: { value: 'Lorem ipsum', instanceId: 'multi-item-base-input' },
};

export default meta;
type Story = StoryObj<typeof MultiItemBaseInput>;

export const Default: Story = {};

export const Focused: Story = {
  args: { autoFocus: true },
};

export const InvalidPlainInput: Story = {
  args: {
    hasError: true,
    error: 'Enter a valid value',
    onChange: fn(),
    onEnter: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Enter a valid value')).toBeVisible();
    await expect(getComputedStyle(input).borderWidth).toBe('0px');
    await expect(getComputedStyle(input).outlineWidth).toBe('2px');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    await expect(args.onEnter).toHaveBeenCalledTimes(1);
  },
};
