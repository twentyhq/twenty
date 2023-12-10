import { z } from 'zod';

import { FieldLinkValue } from '../FieldMetadata';

const linkSchema = z.object({
  url: z.string(),
  label: z.string(),
});

// TODO: add zod
export const isFieldLinkValue = (
  fieldValue: unknown,
): fieldValue is FieldLinkValue => linkSchema.safeParse(fieldValue).success;
