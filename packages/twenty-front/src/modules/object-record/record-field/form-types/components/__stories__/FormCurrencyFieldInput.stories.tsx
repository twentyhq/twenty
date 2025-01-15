import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { FormCurrencyFieldInput } from '../FormCurrencyFieldInput';

const meta: Meta<typeof FormCurrencyFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormCurrencyFieldInput',
  component: FormCurrencyFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormCurrencyFieldInput>;

const defaultSalaryValue: FieldCurrencyValue = {
  currencyCode: CurrencyCode.USD,
  amountMicros: 44000000,
};

export const Default: Story = {
  args: {
    label: 'Salary',
    defaultValue: defaultSalaryValue,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Currency Code');
    await canvas.findByText('Amount Micros');
  },
};

export const WithVariable: Story = {
  args: {
    label: 'Salary',
    defaultValue: {
      currencyCode: CurrencyCode.USD,
      amountMicros: '{{a.b.c}}',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const currency = await canvas.findByText(/USD/);
    expect(currency).toBeVisible();

    const amountVariable = await canvas.findByText('c');
    expect(amountVariable).toBeVisible();
  },
};

export const WithVariablePicker: Story = {
  args: {
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variablePickers = await canvas.findAllByText('VariablePicker');

    expect(variablePickers).toHaveLength(2);
  },
};

export const Disabled: Story = {
  args: {
    label: 'Salary',
    defaultValue: defaultSalaryValue,
    VariablePicker: () => <div>VariablePicker</div>,
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const currency = await canvas.findByText(/USD/);
    expect(currency).toBeVisible();

    const amountInput = await canvas.findByDisplayValue('44000000');
    expect(amountInput).toBeVisible();
    expect(amountInput).toBeDisabled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
