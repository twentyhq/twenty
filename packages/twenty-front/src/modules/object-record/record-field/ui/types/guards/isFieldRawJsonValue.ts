import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { rawJsonFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/rawJsonFieldValueSchema';

export const isFieldRawJsonValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  rawJsonFieldValueSchema.safeParse(fieldValue).success;
