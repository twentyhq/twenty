/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import type Stripe from 'stripe';

type SchedulePhase = Stripe.SubscriptionScheduleUpdateParams.Phase;

const getPhaseStartDate = (
  phase: SchedulePhase,
  previousPhase: SchedulePhase | undefined,
): number | undefined => {
  if (typeof phase.start_date === 'number') {
    return phase.start_date;
  }

  return typeof previousPhase?.end_date === 'number'
    ? previousPhase.end_date
    : undefined;
};

// A phase listing a coupon redeems it again, so phases reuse the live discount, and only while it lasts
export const addLiveDiscountsToSchedulePhases = ({
  phases,
  subscriptionDiscounts,
}: {
  phases: SchedulePhase[];
  subscriptionDiscounts: Pick<Stripe.Discount, 'id' | 'end'>[];
}): SchedulePhase[] =>
  phases.map((phase, index) => {
    const phaseStartDate = getPhaseStartDate(phase, phases[index - 1]);

    const phaseDiscounts = subscriptionDiscounts.filter(
      ({ end }) =>
        !isDefined(end) || !isDefined(phaseStartDate) || end > phaseStartDate,
    );

    return isNonEmptyArray(phaseDiscounts)
      ? {
          ...phase,
          discounts: phaseDiscounts.map(({ id }) => ({ discount: id })),
        }
      : phase;
  });
