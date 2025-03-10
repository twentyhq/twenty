import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormCurrencyFieldInput } from '../FormCurrencyFieldInput';

const meta: Meta<typeof FormCurrencyFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormCurrencyFieldInput',
  component: FormCurrencyFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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
      currencyCode: `{{${MOCKED_STEP_ID}.amount.currencyCode}}` as CurrencyCode,
      amountMicros: `{{${MOCKED_STEP_ID}.amount.amountMicros}}`,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const amountMicros = await canvas.findByText('My Amount Micros');
    const currencyCode = await canvas.findByText('My Currency Code');

    expect(amountMicros).toBeVisible();
    expect(currencyCode).toBeVisible();
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
