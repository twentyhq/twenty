import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { filesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/filesFieldValueSchema';

export const isFieldFilesValue = (
  fieldValue: unknown,
): fieldValue is FieldFilesValue[] =>
  filesFieldValueSchema.safeParse(fieldValue).success;
