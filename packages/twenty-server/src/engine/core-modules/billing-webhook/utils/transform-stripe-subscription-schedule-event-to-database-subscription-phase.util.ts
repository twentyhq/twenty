/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionSchedulePhase } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';

export function transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase(
  schedule: Stripe.SubscriptionSchedule,
): Array<BillingSubscriptionSchedulePhase> {
  return schedule.phases.map((phase) => ({
    startDate: phase.start_date,
    endDate: phase.end_date,
    trialEnd: phase.trial_end,
    items: phase.items.map((item) => ({
      price: typeof item.price === 'string' ? item.price : item.price.id,
      ...(isDefined(item.quantity) ? { quantity: item.quantity } : {}),
    })),
  }));
}
