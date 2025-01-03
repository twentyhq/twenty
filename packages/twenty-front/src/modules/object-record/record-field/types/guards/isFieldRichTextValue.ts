import { FieldRichTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

export const richTextSchema: z.ZodType<FieldRichTextValue> = z.object({
  blocknote: z.string().nullable(),
  markdown: z.string().nullable(),
});

export const isFieldRichTextValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextValue =>
  richTextSchema.safeParse(fieldValue).success;
