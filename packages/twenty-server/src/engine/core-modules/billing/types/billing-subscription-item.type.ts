import { type BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';

export type LicensedBillingSubscriptionItem = Omit<
  BillingSubscriptionItem,
  'quantity'
> & {
  quantity: number;
};

export type MeteredBillingSubscriptionItem = Omit<
  BillingSubscriptionItem,
  'quantity'
> & {
  quantity: null;
};
