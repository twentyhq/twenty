import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormCurrencyAmountFieldInput } from '@/object-record/record-field/ui/form-types/components/FormCurrencyAmountFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type FormFieldCurrencyInputSettings } from '@/object-record/record-field/ui/form-types/types/FormFieldCurrencyInputSettings';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FormFieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { Field } from 'twenty-ui/primitives/input';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type CurrencyCode } from 'twenty-shared/constants';
import { IconCircleOff } from 'twenty-ui/icon';

type FormCurrencyFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldCurrencyValue | null;
  onChange: (value: FormFieldCurrencyValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  amountUnit?: FormFieldCurrencyInputSettings['amountUnit'];
};

export const FormCurrencyFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  amountUnit = 'micros',
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
      amountMicros: newAmountMicros,
    });
  };

  const handleCurrencyCodeChange = (newCurrencyCode: string | null) => {
    onChange({
      currencyCode: (newCurrencyCode as CurrencyCode) ?? null,
      amountMicros: defaultValue?.amountMicros ?? null,
    });
  };

  const AmountInput =
    amountUnit === 'units'
      ? FormCurrencyAmountFieldInput
      : FormNumberFieldInput;

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        <FormSelectFieldInput
          label={t`Currency Code`}
          defaultValue={defaultValue?.currencyCode ?? ''}
          onChange={handleCurrencyCodeChange}
          options={currencies}
          VariablePicker={VariablePicker}
          readonly={readonly}
        />
        <AmountInput
          label={amountUnit === 'units' ? t`Amount` : t`Amount Micros`}
          hint={
            amountUnit === 'micros'
              ? t`Enter amount x 1 000 000 (e.g. $3.21 → 3210000)`
              : undefined
          }
          defaultValue={defaultValue?.amountMicros ?? ''}
          onChange={handleAmountMicrosChange}
          VariablePicker={VariablePicker}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
