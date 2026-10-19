/* @license Enterprise */

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';

export const getCurrentPeriodMaxSeats = ({
  currentPeriodMaxSeats,
  billingSubscriptionItems,
}: Pick<
  BillingSubscriptionEntity,
  'currentPeriodMaxSeats' | 'billingSubscriptionItems'
>): number =>
  Math.max(
    currentPeriodMaxSeats ?? 0,
    billingSubscriptionItems.find(isBaseProductSubscriptionItem)?.quantity ?? 0,
  );
