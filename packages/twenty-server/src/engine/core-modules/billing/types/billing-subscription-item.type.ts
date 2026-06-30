import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';

export type LicensedBillingSubscriptionItem = Omit<
  BillingSubscriptionItemEntity,
  'quantity'
> & {
  quantity: number;
};

export type MeteredBillingSubscriptionItem = Omit<
  BillingSubscriptionItemEntity,
  'quantity'
> & {
  quantity: null;
};
