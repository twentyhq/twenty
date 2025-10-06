import { z } from 'zod';

import { type FieldPdfValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const pdfSchema = z.object({
  attachmentIds: z.array(z.string()),
  fullPaths: z.array(z.string()).optional(),
  names: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
}) satisfies z.ZodType<FieldPdfValue>;

export const isFieldPdfValue = (
  fieldValue: unknown,
): fieldValue is FieldPdfValue => pdfSchema.safeParse(fieldValue).success;
