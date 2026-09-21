import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';

type HasCurrencyValueChangedParams = {
  newValue: FieldCurrencyValue | undefined;
  currentValue: unknown;
};

export const hasCurrencyValueChanged = ({
  newValue,
  currentValue,
}: HasCurrencyValueChangedParams): boolean => {
  if (!isFieldCurrencyValue(newValue) || !isFieldCurrencyValue(currentValue)) {
    return true;
  }

  return (
    newValue.amountMicros !== currentValue.amountMicros ||
    newValue.currencyCode !== currentValue.currencyCode
  );
};
