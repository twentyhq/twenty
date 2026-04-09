import { FormBooleanFieldToggleInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldToggleInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<typeof FormBooleanFieldToggleInput> = {
  title: 'UI/Data/Field/Form/Input/FormBooleanFieldToggleInput',
  component: FormBooleanFieldToggleInput,
  args: {
    description: 'Continue on iteration failure',
    value: false,
    onChange: fn(),
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormBooleanFieldToggleInput>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Continue on iteration failure');

    const checkbox = canvas.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Settings',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Settings');
    await canvas.findByText('Continue on iteration failure');
  },
};

export const WithHint: Story = {
  args: {
    hint: 'If enabled, the workflow will continue to the next iteration even if the current one fails.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'If enabled, the workflow will continue to the next iteration even if the current one fails.',
    );
  },
};

export const ToggledOn: Story = {
  args: {
    value: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkbox = canvas.getByRole('checkbox');

    expect(checkbox).toBeChecked();
  },
};

export const TogglesValue: Story = {
  args: {
    value: false,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const checkbox = canvas.getByRole('checkbox');

    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(true);
    });
  },
};
