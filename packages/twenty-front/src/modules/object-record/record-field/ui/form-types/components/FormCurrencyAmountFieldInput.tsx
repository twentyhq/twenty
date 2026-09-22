import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { isNumber } from '@sniptt/guards';
import { type ComponentProps } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

type FormCurrencyAmountFieldInputProps = Pick<
  ComponentProps<typeof FormNumberFieldInput>,
  'label' | 'defaultValue' | 'onChange' | 'VariablePicker' | 'readonly' | 'hint'
>;

export const FormCurrencyAmountFieldInput = ({
  defaultValue,
  onChange,
  label,
  VariablePicker,
  readonly,
  hint,
}: FormCurrencyAmountFieldInputProps) => {
  const amount =
    !isDefined(defaultValue) || defaultValue === ''
      ? ''
      : isStandaloneVariableString(defaultValue)
        ? defaultValue
        : convertCurrencyMicrosToCurrencyAmount(Number(defaultValue));

  return (
    <FormNumberFieldInput
      label={label}
      VariablePicker={VariablePicker}
      readonly={readonly}
      hint={hint}
      defaultValue={amount}
      onChange={(newAmount) =>
        onChange(
          isNumber(newAmount)
            ? Math.round(convertCurrencyAmountToCurrencyMicros(newAmount))
            : newAmount,
        )
      }
    />
  );
};
