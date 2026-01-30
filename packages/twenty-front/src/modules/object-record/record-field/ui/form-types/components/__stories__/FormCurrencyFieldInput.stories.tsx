import { FormCurrencyFieldInput } from '@/object-record/record-field/ui/form-types/components/FormCurrencyFieldInput';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CurrencyCode } from 'twenty-shared/constants';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormCurrencyFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormCurrencyFieldInput',
  component: FormCurrencyFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
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

    const amountMicros = await canvas.findAllByText('Amount Micros');
    const currencyCode = await canvas.findAllByText('Currency Code');

    expect(amountMicros).toHaveLength(2);
    expect(currencyCode).toHaveLength(2);
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
