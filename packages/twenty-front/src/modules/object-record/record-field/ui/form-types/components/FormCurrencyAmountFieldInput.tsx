import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from 'twenty-shared/utils';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type ComponentProps } from 'react';
import { isStandaloneVariableString } from 'twenty-shared/workflow';

type FormCurrencyAmountFieldInputProps = Pick<
  ComponentProps<typeof FormNumberFieldInput>,
  | 'label'
  | 'defaultValue'
  | 'onChange'
  | 'VariablePicker'
  | 'readonly'
  | 'hint'
  | 'placeholder'
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
  placeholder,
}: FormCurrencyAmountFieldInputProps) => {
  return (
    <FormNumberFieldInput
      label={label}
      VariablePicker={VariablePicker}
      readonly={readonly}
      hint={hint}
      placeholder={placeholder}
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
