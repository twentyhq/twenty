import { z } from 'zod';
import { FieldRichTextValue } from '../FieldMetadata';

export const richTextSchema: z.ZodType<FieldRichTextValue> = z.union([
  z.null(),
  z.string(),
]);

export const isFieldRichTextValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextValue =>
  richTextSchema.safeParse(fieldValue).success;
