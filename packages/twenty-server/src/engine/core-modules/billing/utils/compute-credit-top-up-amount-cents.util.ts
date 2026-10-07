/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export const computeCreditTopUpAmountCents = ({
  creditAmountMicro,
  price,
}: {
  creditAmountMicro: number;
  price: Pick<BillingPriceEntity, 'unitAmount' | 'metadata'>;
}): number => {
  const amount = BigInt(creditAmountMicro) * BigInt(Number(price.unitAmount));
  const divisor = BigInt(Number(price.metadata?.credit_amount));

  return Number((amount + divisor - BigInt(1)) / divisor);
};
