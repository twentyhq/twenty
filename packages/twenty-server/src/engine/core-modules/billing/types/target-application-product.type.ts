/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type TargetApplicationProduct = {
  billingProduct: {
    stripeProductId: string;
    billingPrices: Pick<
      BillingPriceEntity,
      'stripePriceId' | 'interval' | 'active' | 'metadata'
    >[];
  };
  quantity: number;
};
