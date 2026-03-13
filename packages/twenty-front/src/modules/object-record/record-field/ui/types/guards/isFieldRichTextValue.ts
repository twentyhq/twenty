import { type FieldRichTextV2Value } from '@/object-record/record-field/ui/types/FieldMetadata';
import { z } from 'zod';

export const richTextV2Schema: z.ZodType<FieldRichTextV2Value> = z.object({
  blocknote: z.string().nullable(),
  markdown: z.string().nullable(),
});

export const isFieldRichTextV2Value = (
  fieldValue: unknown,
): fieldValue is FieldRichTextV2Value =>
  richTextV2Schema.safeParse(fieldValue).success;
