import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { fullNameFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/fullNameFieldValueSchema';

export const isFieldFullNameValue = (
  fieldValue: unknown,
): fieldValue is FieldFullNameValue =>
  fullNameFieldValueSchema.safeParse(fieldValue).success;
