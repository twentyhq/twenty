import { CurrencyCode } from 'twenty-shared/constants';
import { z } from 'zod';

export const currencyFieldValueSchema = z.object({
  currencyCode: z.union([z.enum(CurrencyCode), z.literal('')]).nullable(),
  amountMicros: z.number().nullable(),
});
