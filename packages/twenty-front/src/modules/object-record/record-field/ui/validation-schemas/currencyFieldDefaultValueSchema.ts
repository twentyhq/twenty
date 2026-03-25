import { z } from 'zod';

import { currencyCodeSchema } from '@/object-record/record-field/ui/validation-schemas/currencyCodeSchema';
import { type CurrencyCode } from 'twenty-shared/constants';
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
