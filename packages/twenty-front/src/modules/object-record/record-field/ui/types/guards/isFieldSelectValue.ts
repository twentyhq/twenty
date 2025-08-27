import { type FieldSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { selectFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/selectFieldValueSchema';

export const isFieldSelectValue = (
  fieldValue: unknown,
  options?: string[],
): fieldValue is FieldSelectValue =>
  selectFieldValueSchema(options).safeParse(fieldValue).success;
