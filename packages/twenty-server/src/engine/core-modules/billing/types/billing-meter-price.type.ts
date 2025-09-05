import type { MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type MeterBillingPrice = BillingPrice & {
  tiers: MeterBillingPriceTiers;
};
