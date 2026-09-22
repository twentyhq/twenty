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
  'label' | 'defaultValue' | 'onChange' | 'VariablePicker' | 'readonly'
>;

export const FormCurrencyAmountFieldInput = ({
  defaultValue,
  onChange,
  label,
  VariablePicker,
  readonly,
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
      defaultValue={amount}
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
