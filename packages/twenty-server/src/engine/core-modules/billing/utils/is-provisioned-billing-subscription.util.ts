/* @license Enterprise */

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const isProvisionedBillingSubscription = (
  subscription: Pick<BillingSubscriptionEntity, 'status'>,
): boolean =>
  subscription.status !== SubscriptionStatus.Incomplete &&
  subscription.status !== SubscriptionStatus.IncompleteExpired;
