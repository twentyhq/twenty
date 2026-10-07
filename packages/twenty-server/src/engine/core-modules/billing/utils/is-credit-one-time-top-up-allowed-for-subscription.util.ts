/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const isCreditOneTimeTopUpAllowedForSubscription = (
  subscription: Pick<
    BillingSubscriptionEntity,
    'status' | 'cancelAt' | 'cancelAtPeriodEnd'
  >,
): boolean =>
  subscription.status === SubscriptionStatus.Active &&
  !subscription.cancelAtPeriodEnd &&
  !isDefined(subscription.cancelAt);
