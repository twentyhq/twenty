import { z } from 'zod';

import { FieldMoneyAmountV2Value } from '../FieldMetadata';

const moneyAmountV2Schema = z.object({
  currency: z.string(),
  amount: z.number(),
});

export const isFieldMoneyAmountV2Value = (
  fieldValue: unknown,
): fieldValue is FieldMoneyAmountV2Value =>
  moneyAmountV2Schema.safeParse(fieldValue).success;
