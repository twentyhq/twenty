import { FormCurrencyAmountFieldInput } from '@/object-record/record-field/ui/form-types/components/FormCurrencyAmountFieldInput';
import { FormCurrencyFieldInput } from '@/object-record/record-field/ui/form-types/components/FormCurrencyFieldInput';
import { type FormFieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';

jest.mock(
  '@/object-record/record-field/ui/form-types/components/VariableChipStandalone',
  () => ({
    VariableChipStandalone: ({
      rawVariableName,
    }: {
      rawVariableName: string;
    }) => <span>{rawVariableName}</span>,
  }),
);

const renderCurrencyInput = (
  amountMicros: FormFieldCurrencyValue['amountMicros'],
  readonly = false,
  amountUnit: 'micros' | 'units' | undefined = 'units',
) => {
  const onChange = jest.fn();
  const store = createStore();
  const Form = () => {
    const [value, setValue] = useState<FormFieldCurrencyValue>({
      currencyCode: CurrencyCode.USD,
      amountMicros,
    });
    return (
      <FormCurrencyFieldInput
        defaultValue={value}
        amountUnit={amountUnit}
        readonly={readonly}
        onChange={(newValue) => {
          setValue(newValue);
          onChange(newValue);
        }}
      />
    );
  };
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <Form />
      </Provider>
    </I18nProvider>,
  );
  return { onChange };
};

it.each([
  [24_000_000_000, '24000'],
  [3_210_000, '3.21'],
  ['3210000', '3.21'],
  [0, '0'],
  [null, ''],
  ['', ''],
])('displays stored micros %s as amount %s', (storedValue, displayedValue) => {
  const { onChange } = renderCurrencyInput(storedValue);
  expect(screen.getByRole('textbox')).toHaveValue(displayedValue);
  expect(screen.getByText('Amount')).toBeInTheDocument();
  expect(screen.queryByText('Amount Micros')).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it.each([
  ['24000', 24_000_000_000],
  ['3.21', 3_210_000],
  ['-12.34', -12_340_000],
  ['0', 0],
  ['0.000249', 249],
])('stores entered amount %s as %s micros', async (amount, amountMicros) => {
  const user = userEvent.setup();
  const { onChange } = renderCurrencyInput(null);
  await user.type(screen.getByRole('textbox'), amount);
  expect(onChange).toHaveBeenLastCalledWith({
    currencyCode: CurrencyCode.USD,
    amountMicros,
  });
  expect(screen.getByRole('textbox')).toHaveValue(amount);
});

it('clears the amount to null', async () => {
  const user = userEvent.setup();
  const { onChange } = renderCurrencyInput(3_210_000);
  await user.clear(screen.getByRole('textbox'));
  expect(onChange).toHaveBeenLastCalledWith({
    currencyCode: CurrencyCode.USD,
    amountMicros: null,
  });
});

it('preserves the stored amount when switching currency', async () => {
  const user = userEvent.setup();
  const { onChange } = renderCurrencyInput(3_210_000);
  await user.click(screen.getByText(/\(USD\)/));
  await user.click(await screen.findByText(/\(EUR\)/));
  expect(onChange).toHaveBeenLastCalledWith({
    currencyCode: CurrencyCode.EUR,
    amountMicros: 3_210_000,
  });
  expect(screen.getByRole('textbox')).toHaveValue('3.21');
});

it('preserves workflow variable references', () => {
  const reference = '{{step.amount.amountMicros}}';
  const { onChange } = renderCurrencyInput(reference);
  expect(screen.getByText(reference)).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});

it('displays read-only amounts in currency units', () => {
  renderCurrencyInput(44_000_000, true);
  expect(screen.getByRole('textbox')).toHaveValue('44');
  expect(screen.getByRole('textbox')).toBeDisabled();
});

it('passes selected workflow variables through without converting them', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const reference = '{{step.amount.amountMicros}}';
  render(
    <FormCurrencyAmountFieldInput
      defaultValue=""
      onChange={onChange}
      VariablePicker={({ onVariableSelect }) => (
        <button onClick={() => onVariableSelect(reference)}>
          Choose variable
        </button>
      )}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Choose variable' }));
  expect(onChange).toHaveBeenCalledWith(reference);
});

it('preserves raw micros for workflow currency forms', async () => {
  const user = userEvent.setup();
  const { onChange } = renderCurrencyInput(3_210_000, false, 'micros');
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('3210000');
  expect(screen.getByText('Amount Micros')).toBeInTheDocument();
  await user.clear(input);
  await user.type(input, '24');
  expect(onChange).toHaveBeenLastCalledWith({
    currencyCode: CurrencyCode.USD,
    amountMicros: 24,
  });
});
