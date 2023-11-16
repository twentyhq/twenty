import { z } from 'zod';

import { FieldLinkValue } from '../FieldMetadata';

const linkSchema = z.object({
  link: z.string(),
  text: z.string(),
});

// TODO: add zod
export const isFieldLinkValue = (
  fieldValue: unknown,
): fieldValue is FieldLinkValue => linkSchema.safeParse(fieldValue).success;
