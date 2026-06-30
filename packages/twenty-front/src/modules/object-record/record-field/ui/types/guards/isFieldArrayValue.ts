import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';

export const isFieldArrayValue = (
  fieldValue: unknown,
): fieldValue is FieldArrayValue =>
  arrayFieldValueSchema.safeParse(fieldValue).success;
