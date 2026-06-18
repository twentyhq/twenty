import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FormFieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type CurrencyCode } from 'twenty-shared/constants';
import { IconCircleOff } from 'twenty-ui/display';

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
      amountMicros: newAmountMicros,
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
          label={t`Amount Micros`}
          defaultValue={defaultValue?.amountMicros ?? ''}
          onChange={handleAmountMicrosChange}
          VariablePicker={VariablePicker}
          hint={t`Enter amount x 1 000 000 (e.g. $3.21 → 3210000)`}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
