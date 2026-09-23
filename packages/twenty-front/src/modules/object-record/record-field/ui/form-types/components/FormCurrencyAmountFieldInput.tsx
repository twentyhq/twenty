import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type ComponentProps } from 'react';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

type FormCurrencyAmountFieldInputProps = Pick<
  ComponentProps<typeof FormNumberFieldInput>,
  'label' | 'defaultValue' | 'onChange' | 'VariablePicker' | 'readonly' | 'hint'
>;

const getAmountFromAmountMicros = (
  amountMicros: FormCurrencyAmountFieldInputProps['defaultValue'],
) => {
  if (isNumber(amountMicros)) {
    return convertCurrencyMicrosToCurrencyAmount(amountMicros);
  }

  if (!isNonEmptyString(amountMicros)) {
    return '';
  }

  if (isStandaloneVariableString(amountMicros)) {
    return amountMicros;
  }

  return convertCurrencyMicrosToCurrencyAmount(Number(amountMicros));
};

export const FormCurrencyAmountFieldInput = ({
  defaultValue,
  onChange,
  label,
  VariablePicker,
  readonly,
  hint,
}: FormCurrencyAmountFieldInputProps) => {
  return (
    <FormNumberFieldInput
      label={label}
      VariablePicker={VariablePicker}
      readonly={readonly}
      hint={hint}
      defaultValue={getAmountFromAmountMicros(defaultValue)}
      onChange={(newAmount) =>
        onChange(
          isNumber(newAmount)
            ? convertCurrencyAmountToCurrencyMicros(newAmount)
            : newAmount,
        )
      }
    />
  );
};
