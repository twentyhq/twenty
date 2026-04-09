import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FormPhoneFieldInput } from '@/object-record/record-field/ui/form-types/components/FormPhoneFieldInput';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormPhoneFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormPhoneFieldInput',
  component: FormPhoneFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
};

export default meta;

type Story = StoryObj<typeof FormPhoneFieldInput>;

const defaultPhoneValue: FieldPhonesValue = {
  primaryPhoneNumber: '0612345678',
  primaryPhoneCountryCode: 'FR',
  primaryPhoneCallingCode: '+33',
};

const FormPhoneFieldInputWithState = ({
  defaultValue,
  label,
  onChange,
  readonly,
  VariablePicker,
}: React.ComponentProps<typeof FormPhoneFieldInput>) => {
  const [value, setValue] = useState<FieldPhonesValue | undefined>(
    defaultValue,
  );

  return (
    <FormPhoneFieldInput
      label={label}
      defaultValue={value}
      onChange={(newValue) => {
        setValue(newValue);
        onChange?.(newValue);
      }}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};

export const Default: Story = {
  args: {
    label: 'Phone',
    defaultValue: defaultPhoneValue,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Phone');
  },
};

export const WithVariablesAsDefaultValues: Story = {
  args: {
    label: 'Phone',
    defaultValue: {
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: `{{${MOCKED_STEP_ID}.name}}`,
      primaryPhoneNumber: `{{${MOCKED_STEP_ID}.amount.amountMicros}}`,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const callingCodeVariable = await canvas.findByText('Name');
    expect(callingCodeVariable).toBeVisible();

    const variablePickers = await canvas.findAllByText('VariablePicker');

    expect(variablePickers).toHaveLength(2);

    for (const variablePicker of variablePickers) {
      expect(variablePicker).toBeVisible();
    }
  },
};

export const SelectingVariables: Story = {
  args: {
    label: 'Phone',
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.amount.amountMicros}}`);
          }}
        >
          Add variable
        </button>
      );
    },
    onChange: fn(),
  },
  render: (args) => (
    <FormPhoneFieldInputWithState
      label={args.label}
      defaultValue={args.defaultValue}
      onChange={args.onChange}
      readonly={args.readonly}
      VariablePicker={args.VariablePicker}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const callingCodeDefaultValue = await canvas.findByText('No calling code');

    expect(callingCodeDefaultValue).toBeVisible();

    const phoneNumberDefaultValue =
      await canvas.findByPlaceholderText('Enter phone number');
    expect(phoneNumberDefaultValue).toHaveDisplayValue('');

    const addVariableButtons = await canvas.findAllByText('Add variable');
    const phoneNumberVariablePicker = addVariableButtons[1];

    await userEvent.click(phoneNumberVariablePicker);

    const phoneNumberVariable = await canvas.findByText('Amount Micros');
    expect(phoneNumberVariable).toBeVisible();

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith({
        primaryPhoneNumber: `{{${MOCKED_STEP_ID}.amount.amountMicros}}`,
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
      });
    });
  },
};

export const Disabled: Story = {
  args: {
    label: 'Phone',
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const callingCodeInput = await canvas.findByText('No calling code');
    expect(callingCodeInput).toBeVisible();

    await userEvent.click(callingCodeInput);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();

    const phoneNumberInput =
      await canvas.findByPlaceholderText('Enter phone number');
    expect(phoneNumberInput).toBeDisabled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
