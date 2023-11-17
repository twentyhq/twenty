import { z } from 'zod';

import { FieldFullNameValue } from '../FieldMetadata';

const currencySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export const isFieldFullNameValue = (
  fieldValue: unknown,
): fieldValue is FieldFullNameValue =>
  currencySchema.safeParse(fieldValue).success;
