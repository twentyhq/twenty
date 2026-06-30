import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { currencyFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/currencyFieldValueSchema';

export const isFieldCurrencyValue = (
  fieldValue: unknown,
): fieldValue is FieldCurrencyValue =>
  currencyFieldValueSchema.safeParse(fieldValue).success;
