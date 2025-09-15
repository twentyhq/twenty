import { type BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import {
  type LicensedBillingSubscriptionItem,
  type MeteredBillingSubscriptionItem,
} from 'src/engine/core-modules/billing/types/billing-subscription-item.type';

export type BillingSubscriptionWithSubscriptionItems = Omit<
  BillingSubscription,
  'billingSubscriptionItems'
> & {
  billingSubscriptionItems: Array<
    LicensedBillingSubscriptionItem | MeteredBillingSubscriptionItem
  >;
};
