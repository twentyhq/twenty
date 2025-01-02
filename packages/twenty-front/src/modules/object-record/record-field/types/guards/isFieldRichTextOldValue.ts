import { z } from 'zod';
import { FieldRichTextOldValue } from '../FieldMetadata';

export const richTextOldSchema: z.ZodType<FieldRichTextOldValue> = z.union([
  z.null(), // Exclude literal values other than null
  z.string(),
]);

export const isFieldRichTextOldValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextOldValue =>
  richTextOldSchema.safeParse(fieldValue).success;
