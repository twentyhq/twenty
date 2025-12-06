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
        label: 'No currency',
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
      amountMicros:
        newAmountMicros != null
          ? Number.isFinite(+newAmountMicros)
            ? convertCurrencyAmountToCurrencyMicros(Number(newAmountMicros))
            : null
          : null,
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
          label="Currency Code"
          defaultValue={defaultValue?.currencyCode ?? ''}
          onChange={handleCurrencyCodeChange}
          options={currencies}
          VariablePicker={VariablePicker}
          readonly={readonly}
        />
        <FormNumberFieldInput
          label="Amount"
          defaultValue={
            defaultValue?.amountMicros != null
              ? Number.isFinite(+defaultValue.amountMicros)
                ? convertCurrencyMicrosToCurrencyAmount(
                    +defaultValue.amountMicros,
                  )
                : defaultValue.amountMicros
              : ''
          }
          onChange={handleAmountMicrosChange}
          VariablePicker={VariablePicker}
          placeholder="Set 3.21 for $3.21"
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
