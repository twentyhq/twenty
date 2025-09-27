import { z } from 'zod';

import { type CurrencyCode } from '@/object-record/record-field/ui/types/CurrencyCode';
import { currencyCodeSchema } from '@/object-record/record-field/ui/validation-schemas/currencyCodeSchema';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const currencyFieldDefaultValueSchema = z.object({
  amountMicros: z.number().nullable(),
  currencyCode: simpleQuotesStringSchema.refine(
    (value): value is `'${CurrencyCode}'` =>
      currencyCodeSchema.safeParse(stripSimpleQuotesFromString(value)).success,
    {
      error: 'String is not a valid currencyCode',
    },
  ),
});
