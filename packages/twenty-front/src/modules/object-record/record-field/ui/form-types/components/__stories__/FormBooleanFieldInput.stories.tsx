import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';

const meta: Meta<typeof FormBooleanFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormBooleanFieldInput',
  component: FormBooleanFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof FormBooleanFieldInput>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Select a value');
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Boolean',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Boolean');
  },
};

export const EmptyByDefault: Story = {
  args: {
    defaultValue: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Select a value');
  },
};

export const TrueByDefault: Story = {
  args: {
    defaultValue: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('True');
  },
};

export const FalseByDefault: Story = {
  args: {
    defaultValue: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('False');
  },
};

export const WithVariablePicker: Story = {
  args: {
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variablePicker = await canvas.findByText('VariablePicker');

    expect(variablePicker).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    readonly: true,
    defaultValue: false,
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = await canvas.findByText('False');
    expect(toggle).toBeVisible();

    await userEvent.click(toggle);

    expect(toggle).toHaveTextContent('False');

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();
  },
};

export const ChangesValueToTrue: Story = {
  args: {
    defaultValue: undefined,
    label: 'Boolean',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const select = await canvas.findByText('Select a value');

    await userEvent.click(select);

    const trueOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('True');

    await userEvent.click(trueOption);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(true);
    });
  },
};

export const ChangesValueToFalse: Story = {
  args: {
    defaultValue: undefined,
    label: 'Boolean',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const select = await canvas.findByText('Select a value');

    await userEvent.click(select);

    const falseOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('False');

    await userEvent.click(falseOption);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(false);
    });
  },
};

export const ChangesValueToVariable: Story = {
  args: {
    defaultValue: undefined,
    label: 'Boolean',
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

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(`{{${MOCKED_STEP_ID}.name}}`);
    });
  },
};
