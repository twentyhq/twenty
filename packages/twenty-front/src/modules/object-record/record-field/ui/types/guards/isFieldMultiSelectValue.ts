import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { multiSelectFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/multiSelectFieldValueSchema';

export const isFieldMultiSelectValue = (
  fieldValue: unknown,
  options?: string[],
): fieldValue is FieldMultiSelectValue => {
  return multiSelectFieldValueSchema(options).safeParse(fieldValue).success;
};
