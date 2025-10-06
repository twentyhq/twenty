import { z } from 'zod';

import { type FieldImageValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const imageSchema = z.object({
  attachmentIds: z.array(z.string()),
  fullPaths: z.array(z.string()).optional(),
  names: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
}) satisfies z.ZodType<FieldImageValue>;

export const isFieldImageValue = (
  fieldValue: unknown,
): fieldValue is FieldImageValue => imageSchema.safeParse(fieldValue).success;
