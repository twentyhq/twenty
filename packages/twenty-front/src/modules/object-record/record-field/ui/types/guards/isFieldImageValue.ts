import { z } from 'zod';

import { type FieldImageValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { type FieldImageValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const optionalStringArray = z
  .array(z.string())
  .nullish()
  .transform((value) => value ?? undefined);

export const imageSchema = z
  .object({
    attachmentIds: z.array(z.string()),
    fullPaths: optionalStringArray,
    names: optionalStringArray,
    types: optionalStringArray,
  })
  satisfies z.ZodType<FieldImageValue>;

export const isFieldImageValue = (
  fieldValue: unknown,
): fieldValue is FieldImageValue => imageSchema.safeParse(fieldValue).success;
