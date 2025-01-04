import { z } from 'zod';
import { FieldRichTextDeprecatedValue } from '../FieldMetadata';

export const richTextDeprecatedSchema: z.ZodType<FieldRichTextDeprecatedValue> =
  z.union([
    z.null(), // Exclude literal values other than null
    z.string(),
  ]);

export const isFieldRichTextDeprecatedValue = (
  fieldValue: unknown,
): fieldValue is FieldRichTextDeprecatedValue =>
  richTextDeprecatedSchema.safeParse(fieldValue).success;
