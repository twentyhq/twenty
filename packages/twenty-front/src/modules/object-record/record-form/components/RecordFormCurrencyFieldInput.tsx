import { FormCurrencyAmountFieldInput } from '@/object-record/record-field/ui/form-types/components/FormCurrencyAmountFieldInput';
import {
  type FieldCurrencyValue,
  type FormFieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { isNonEmptyString } from '@sniptt/guards';
import { CurrencyCode } from 'twenty-shared/constants';

type RecordFormCurrencyFieldInputProps = {
  label?: string;
  defaultValue?: FieldCurrencyValue;
  defaultCurrencyCode?: CurrencyCode;
  onChange: (value: FormFieldCurrencyValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormCurrencyFieldInput = ({
  label,
  defaultValue,
  defaultCurrencyCode,
  onChange,
  readonly,
  placeholder,
}: RecordFormCurrencyFieldInputProps) => {
  const currencyCode = isNonEmptyString(defaultValue?.currencyCode)
    ? defaultValue.currencyCode
    : (defaultCurrencyCode ?? CurrencyCode.USD);

  const handleCurrencyCodeChange = (newCurrencyCode: string) =>
    onChange({
      currencyCode: newCurrencyCode as CurrencyCode,
      amountMicros: defaultValue?.amountMicros ?? null,
    });

  const handleAmountMicrosChange = (
    amountMicros: FormFieldCurrencyValue['amountMicros'],
  ) => onChange({ currencyCode, amountMicros });

  return (
    <FormCurrencyAmountFieldInput
      label={label}
      defaultValue={defaultValue?.amountMicros ?? ''}
      onChange={handleAmountMicrosChange}
      readonly={readonly}
      placeholder={placeholder}
      leftElement={
        <CurrencyPickerDropdownButton
          selectedCurrencyCode={currencyCode}
          onChange={handleCurrencyCodeChange}
          disabled={readonly}
        />
      }
    />
  );
};
