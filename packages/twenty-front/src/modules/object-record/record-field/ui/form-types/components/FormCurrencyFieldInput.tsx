import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FormFieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useMemo } from 'react';
import { type CurrencyCode } from 'twenty-shared/constants';
import { IconCircleOff } from 'twenty-ui/display';
import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

const formatMicrosToDisplayAmount = (
  amountMicros: string | number | null | undefined,
): string | number => {
  if (amountMicros == null) {
    return '';
  }
  if (Number.isFinite(+amountMicros)) {
    return convertCurrencyMicrosToCurrencyAmount(+amountMicros);
  }
  return amountMicros;
};

const parseDisplayAmountToMicros = (
  displayAmount: string | number | null,
): number | null => {
  if (displayAmount == null) {
    return null;
  }
  if (Number.isFinite(+displayAmount)) {
    return convertCurrencyAmountToCurrencyMicros(Number(displayAmount));
  }
  return null;
};

type FormCurrencyFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldCurrencyValue | null;
  onChange: (value: FormFieldCurrencyValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormCurrencyFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
}: FormCurrencyFieldInputProps) => {
  const currencies = useMemo(() => {
    return [
      {
        label: t`No currency`,
        value: '',
        Icon: IconCircleOff,
      },
      ...CURRENCIES,
    ];
  }, []);

  const handleAmountMicrosChange = (
    newAmountMicros: string | number | null,
  ) => {
    onChange({
      currencyCode: defaultValue?.currencyCode ?? null,
      amountMicros: parseDisplayAmountToMicros(newAmountMicros),
    });
  };

  const handleCurrencyCodeChange = (newCurrencyCode: string | null) => {
    onChange({
      currencyCode: (newCurrencyCode as CurrencyCode) ?? null,
      amountMicros: defaultValue?.amountMicros ?? null,
    });
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormSelectFieldInput
          label={t`Currency Code`}
          defaultValue={defaultValue?.currencyCode ?? ''}
          onChange={handleCurrencyCodeChange}
          options={currencies}
          VariablePicker={VariablePicker}
          readonly={readonly}
        />
        <FormNumberFieldInput
          label={t`Amount`}
          defaultValue={formatMicrosToDisplayAmount(defaultValue?.amountMicros)}
          onChange={handleAmountMicrosChange}
          VariablePicker={VariablePicker}
          placeholder={t`Set 3.21 for $3.21`}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
