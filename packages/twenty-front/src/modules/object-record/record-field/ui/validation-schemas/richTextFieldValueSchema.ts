import { z } from 'zod';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const richTextFieldValueSchema = z.object({
  blocknote: z.string().nullable(),
  markdown: z.string().nullable(),
}) satisfies z.ZodType<FieldRichTextValue>;
