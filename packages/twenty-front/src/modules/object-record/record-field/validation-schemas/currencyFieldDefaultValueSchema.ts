import { z } from 'zod';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { currencyCodeSchema } from '@/object-record/record-field/validation-schemas/currencyCodeSchema';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const currencyFieldDefaultValueSchema = z.object({
  amountMicros: z.number().nullable(),
  currencyCode: simpleQuotesStringSchema.refine(
    (value): value is `'${CurrencyCode}'` =>
      currencyCodeSchema.safeParse(stripSimpleQuotesFromString(value)).success,
    { message: 'String is not a valid currencyCode' },
  ),
});
