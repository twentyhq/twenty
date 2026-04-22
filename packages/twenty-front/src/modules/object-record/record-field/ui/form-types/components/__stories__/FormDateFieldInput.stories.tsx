import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormDateFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormDateFieldInput',
  component: FormDateFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
};

export default meta;

type Story = StoryObj<typeof FormDateFieldInput>;

export const Default: Story = {
  args: {
    label: 'Date',
    defaultValue: undefined,
    onChange: fn(),
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Date',
    defaultValue: '2024-06-15',
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date',
    defaultValue: '2024-06-15',
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await waitFor(() => {
      const inputElement = canvasElement.querySelector<HTMLInputElement>(
        'input:not([type="file"])',
      );
      expect(inputElement).not.toBeNull();
      return inputElement!;
    });

    expect(input).toBeDisabled();

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();

    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Date',
    defaultValue: `{{${MOCKED_STEP_ID}.name}}`,
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variable = await canvas.findByText('Name');
    expect(variable).toBeVisible();

    const deleteVariableButton = canvas.queryByRole('button');
    expect(deleteVariableButton).not.toBeInTheDocument();
  },
};

export const WithVariable: Story = {
  args: {
    label: 'Date',
    defaultValue: undefined,
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.click(addVariableButton);

    const variable = await canvas.findByText('Name');
    expect(variable).toBeVisible();

    expect(args.onChange).toHaveBeenCalledWith(`{{${MOCKED_STEP_ID}.name}}`);
  },
};
