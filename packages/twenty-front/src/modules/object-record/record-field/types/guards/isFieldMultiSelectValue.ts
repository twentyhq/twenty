import { FieldSelectValue } from '@/object-record/record-field/types/FieldMetadata.ts';
import { selectFieldValueSchema } from '@/object-record/record-field/validation-schemas/selectFieldValueSchema.ts';

export const isFieldMultiSelectValue = (
  fieldValue: unknown,
  options?: string[],
): fieldValue is FieldSelectValue =>
  selectFieldValueSchema(options).safeParse(fieldValue).success;
