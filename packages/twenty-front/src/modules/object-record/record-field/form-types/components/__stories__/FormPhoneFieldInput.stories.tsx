import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormPhoneFieldInput } from '../FormPhoneFieldInput';

const meta: Meta<typeof FormPhoneFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormPhoneFieldInput',
  component: FormPhoneFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof FormPhoneFieldInput>;

const defaultPhoneValue: FieldPhonesValue = {
  primaryPhoneNumber: '0612345678',
  primaryPhoneCountryCode: 'FR',
  primaryPhoneCallingCode: '33',
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
      primaryPhoneCountryCode: `{{${MOCKED_STEP_ID}.name}}`,
      primaryPhoneNumber: `{{${MOCKED_STEP_ID}.amount.amountMicros}}`,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const countryCodeVariable = await canvas.findByText('Name');
    expect(countryCodeVariable).toBeVisible();

    const variablePickers = await canvas.findAllByText('VariablePicker');

    expect(variablePickers).toHaveLength(1);

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
            onVariableSelect(`{{${MOCKED_STEP_ID}.phone.number}}`);
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

    const countryCodeDefaultValue = await canvas.findByText('No country');
    expect(countryCodeDefaultValue).toBeVisible();

    const phoneNumberDefaultValue =
      await canvas.findByPlaceholderText('Enter phone number');
    expect(phoneNumberDefaultValue).toHaveDisplayValue('');

    const phoneNumberVariablePicker = await canvas.findByText('Add variable');

    await userEvent.click(phoneNumberVariablePicker);

    const phoneNumberVariable = await canvas.findByText('My Number');
    expect(phoneNumberVariable).toBeVisible();

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith({
        primaryPhoneNumber: `{{${MOCKED_STEP_ID}.phone.number}}`,
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

    const countryInput = await canvas.findByText('No country');
    expect(countryInput).toBeVisible();

    await userEvent.click(countryInput);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();

    const phoneNumberInput =
      await canvas.findByPlaceholderText('Enter phone number');
    expect(phoneNumberInput).toBeDisabled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
