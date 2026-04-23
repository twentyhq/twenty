import { z } from 'zod';

import { CurrencyCode } from 'twenty-shared/constants';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const currencySchema = z.object({
  currencyCode: z.union([z.enum(CurrencyCode), z.literal('')]).nullable(),
  amountMicros: z.number().nullable(),
});

export const isFieldCurrencyValue = (
  fieldValue: unknown,
): fieldValue is FieldCurrencyValue =>
  currencySchema.safeParse(fieldValue).success;
