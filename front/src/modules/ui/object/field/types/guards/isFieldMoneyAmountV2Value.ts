import { z } from 'zod';

import { FieldMoneyValue } from '../FieldMetadata';

const moneyAmountV2Schema = z.object({
  currency: z.string(),
  amount: z.number(),
});

export const isFieldMoneyAmountV2Value = (
  fieldValue: unknown,
): fieldValue is FieldMoneyValue =>
  moneyAmountV2Schema.safeParse(fieldValue).success;
