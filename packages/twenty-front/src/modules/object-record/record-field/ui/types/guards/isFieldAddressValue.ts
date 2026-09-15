import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { addressFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/addressFieldValueSchema';

export const isFieldAddressValue = (
  fieldValue: unknown,
): fieldValue is FieldAddressValue =>
  addressFieldValueSchema.safeParse(fieldValue).success;
