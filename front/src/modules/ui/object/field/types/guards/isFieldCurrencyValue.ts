import { z } from 'zod';

import { FieldCurrencyValue } from '../FieldMetadata';

const currencySchema = z.object({
  currency: z.string(),
  amount: z.number(),
});

export const isFieldCurrencyValue = (
  fieldValue: unknown,
): fieldValue is FieldCurrencyValue =>
  currencySchema.safeParse(fieldValue).success;
