/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionSchedulePhaseDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';

export function transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase(
  schedule: Pick<Stripe.SubscriptionSchedule, 'current_phase'> & {
    phases: Pick<
      Stripe.SubscriptionSchedule.Phase,
      'start_date' | 'end_date' | 'items'
    >[];
  },
): Array<BillingSubscriptionSchedulePhaseDTO> {
  const currentPhaseStartDate = schedule.current_phase?.start_date;

  return schedule.phases
    .filter(
      (phase) =>
        !isDefined(currentPhaseStartDate) ||
        phase.start_date >= currentPhaseStartDate,
    )
    .map((phase) => ({
      start_date: phase.start_date,
      end_date: phase.end_date,
      items: phase.items.map((item) => ({
        price: typeof item.price === 'string' ? item.price : item.price.id,
        ...(isDefined(item.quantity) ? { quantity: item.quantity } : {}),
      })),
    }));
}
