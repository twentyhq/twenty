import { z } from 'zod';

import { FieldFullNameValue } from '../FieldMetadata';

const fullNameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export const isFieldFullNameValue = (
  fieldValue: unknown,
): fieldValue is FieldFullNameValue =>
  fullNameSchema.safeParse(fieldValue).success;
