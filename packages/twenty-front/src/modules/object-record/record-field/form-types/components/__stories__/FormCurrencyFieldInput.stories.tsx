import { FormCurrencyFieldInput } from '../FormCurrencyFieldInput';
import { Meta, StoryObj } from '@storybook/react';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { within } from '@storybook/test';

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
