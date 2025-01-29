import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { FormPhoneFieldInput } from '../FormPhoneFieldInput';

const meta: Meta<typeof FormPhoneFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormPhoneFieldInput',
  component: FormPhoneFieldInput,
  args: {},
  argTypes: {},
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

export const SelectCountryCode: Story = {
  args: {
    label: 'Phone',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const defaultEmptyOption = await canvas.findByText('No country');
    expect(defaultEmptyOption).toBeVisible();

    await userEvent.click(defaultEmptyOption);

    const searchInput = await canvas.findByPlaceholderText('Search');
    expect(searchInput).toBeVisible();

    await userEvent.type(searchInput, 'France');

    const franceOption = await canvas.findByText(/France/);

    await userEvent.click(franceOption);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith({
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneCallingCode: '33',
      });
    });

    expect(args.onPersist).toHaveBeenCalledTimes(1);
  },
};

export const SelectEmptyCountryCode: Story = {
  args: {
    label: 'Phone',
    onPersist: fn(),
    defaultValue: {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '33',
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const defaultSelectedOption = await canvas.findByText(/France/);
    expect(defaultSelectedOption).toBeVisible();

    await userEvent.click(defaultSelectedOption);

    const searchInput = await canvas.findByPlaceholderText('Search');
    expect(searchInput).toBeVisible();

    const emptyOption = await canvas.findByText('No country');

    await userEvent.click(emptyOption);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith({
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
      });
    });

    expect(args.onPersist).toHaveBeenCalledTimes(1);
  },
};

export const WithVariablesAsDefaultValues: Story = {
  args: {
    label: 'Phone',
    defaultValue: {
      primaryPhoneCountryCode: '{{a.countryCode}}',
      primaryPhoneNumber: '{{a.phoneNumber}}',
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const countryCodeVariable = await canvas.findByText('countryCode');
    expect(countryCodeVariable).toBeVisible();

    const phoneNumberVariable = await canvas.findByText('phoneNumber');
    expect(phoneNumberVariable).toBeVisible();

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
            onVariableSelect('{{test}}');
          }}
        >
          Add variable
        </button>
      );
    },
    onPersist: fn(),
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

    const phoneNumberVariable = await canvas.findByText('test');
    expect(phoneNumberVariable).toBeVisible();

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith({
        primaryPhoneNumber: '{{test}}',
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
