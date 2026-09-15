import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { richTextFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/richTextFieldValueSchema';

export const isFieldRichTextValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextValue =>
  richTextFieldValueSchema.safeParse(fieldValue).success;
