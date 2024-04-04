import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata.ts';
import { multiSelectFieldValueSchema } from '@/object-record/record-field/validation-schemas/multiSelectFieldValueSchema.ts';

export const isFieldMultiSelectValue = (
  fieldValue: unknown,
  options?: string[],
): fieldValue is FieldMultiSelectValue => {
  return multiSelectFieldValueSchema(options).safeParse(fieldValue).success;
};
