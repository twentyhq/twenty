import { z } from 'zod';

import { FieldCurrencyValue } from '../FieldMetadata';

const currencySchema = z.object({
  currencyCode: z.string(),
  amountMicros: z.number(),
});

export const isFieldCurrencyValue = (
  fieldValue: unknown,
): fieldValue is FieldCurrencyValue =>
  currencySchema.safeParse(fieldValue).success;
