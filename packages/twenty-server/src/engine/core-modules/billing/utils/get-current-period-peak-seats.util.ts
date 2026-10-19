/* @license Enterprise */

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';

export const getCurrentPeriodPeakSeats = ({
  currentPeriodPeakSeats,
  billingSubscriptionItems,
}: Pick<
  BillingSubscriptionEntity,
  'currentPeriodPeakSeats' | 'billingSubscriptionItems'
>): number =>
  Math.max(
    currentPeriodPeakSeats ?? 0,
    billingSubscriptionItems.find(isBaseProductSubscriptionItem)?.quantity ?? 0,
  );
