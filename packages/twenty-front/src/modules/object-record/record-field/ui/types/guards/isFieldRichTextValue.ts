import { z } from 'zod';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const richTextSchema: z.ZodType<FieldRichTextValue> = z.union([
  z.null(),
  z.string(),
]);

export const isFieldRichTextValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextValue =>
  richTextSchema.safeParse(fieldValue).success;
