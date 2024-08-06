import { z } from 'zod';

import { FieldFullNameValue } from '../FieldMetadata';

const fullnameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export const isFieldFullNameValue = (
  fieldValue: unknown,
): fieldValue is FieldFullNameValue =>
  fullnameSchema.safeParse(fieldValue).success;
