import { z } from 'zod';

import { CurrencyCode } from 'twenty-shared/constants';
import { type FieldCurrencyValue } from '../FieldMetadata';

const currencySchema = z.object({
  currencyCode: z.enum(CurrencyCode).nullable(),
  amountMicros: z.number().nullable(),
});

export const isFieldCurrencyValue = (
  fieldValue: unknown,
): fieldValue is FieldCurrencyValue =>
  currencySchema.safeParse(fieldValue).success;
