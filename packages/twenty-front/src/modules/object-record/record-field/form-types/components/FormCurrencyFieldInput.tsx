import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FormFieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useMemo } from 'react';

type FormCurrencyFieldInputProps = {
  label?: string;
  defaultValue?: FormFieldCurrencyValue | null;
  onPersist: (value: FormFieldCurrencyValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormCurrencyFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
  readonly,
}: FormCurrencyFieldInputProps) => {
  const currencies = useMemo(() => {
    return Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(
      ([key, { Icon, label }]) => ({
        value: key,
        icon: Icon,
        label: `${label} (${key})`,
      }),
    );
  }, []);

  const handleAmountMicrosChange = (
    newAmountMicros: string | number | null,
  ) => {
    onPersist({
      currencyCode: defaultValue?.currencyCode ?? null,
      amountMicros: newAmountMicros ?? null,
    });
  };

  const handleCurrencyCodeChange = (newCurrencyCode: string | null) => {
    onPersist({
      currencyCode: (newCurrencyCode as CurrencyCode) ?? null,
      amountMicros: defaultValue?.amountMicros ?? null,
    });
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormSelectFieldInput
          label="Currency Code"
          defaultValue={defaultValue?.currencyCode ?? ''}
          onPersist={handleCurrencyCodeChange}
          options={currencies}
          clearLabel={'Currency Code'}
          VariablePicker={VariablePicker}
          readonly={readonly}
          placeholder="Select a currency"
          preventDisplayPadding
        />
        <FormNumberFieldInput
          label="Amount Micros"
          defaultValue={defaultValue?.amountMicros ?? ''}
          onPersist={handleAmountMicrosChange}
          VariablePicker={VariablePicker}
          placeholder="Set 3210000 for 3.21$"
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
