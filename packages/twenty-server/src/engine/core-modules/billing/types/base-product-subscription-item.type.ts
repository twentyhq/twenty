import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';

export type BaseProductSubscriptionItem = Omit<
  BillingSubscriptionItemEntity,
  'quantity'
> & {
  quantity: number;
};
