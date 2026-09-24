import { FormBooleanFieldSwitchInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldSwitchInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<typeof FormBooleanFieldSwitchInput> = {
  title: 'UI/Data/Field/Form/Input/FormBooleanFieldSwitchInput',
  component: FormBooleanFieldSwitchInput,
  args: {
    description: 'Continue on iteration failure',
    value: false,
    onChange: fn(),
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormBooleanFieldSwitchInput>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Continue on iteration failure');

    const control = canvas.getByRole('switch');

    expect(control).not.toBeChecked();
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
    expect(
      canvas.getByRole('switch', { name: 'Continue on iteration failure' }),
    ).not.toBeChecked();
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

export const Checked: Story = {
  args: {
    value: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const control = canvas.getByRole('switch');

    expect(control).toBeChecked();
  },
};

export const ChangesValue: Story = {
  args: {
    value: false,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const control = canvas.getByRole('switch');

    await userEvent.click(control);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(true);
    });
  },
};
