/* @license Enterprise */

import { findOrThrow, isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

// Stripe applies a phase seconds after its start date, and test clocks run on their own time, so wall time cannot pick the phase
export const getScheduleCurrentAndNextPhasesOrThrow = (
  schedule: Pick<Stripe.SubscriptionSchedule, 'current_phase' | 'phases'>,
): {
  currentPhase: Stripe.SubscriptionSchedule.Phase;
  nextPhase: Stripe.SubscriptionSchedule.Phase | undefined;
} => {
  const currentPhaseStartDate = schedule.current_phase?.start_date;

  const currentPhase = findOrThrow(
    schedule.phases,
    (phase) =>
      isDefined(currentPhaseStartDate) &&
      phase.start_date === currentPhaseStartDate,
    new BillingException(
      `Subscription must have at least 1 current phase`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND,
    ),
  );

  const nextPhase = schedule.phases
    .filter((phase) => phase.start_date > currentPhase.start_date)
    .sort((phaseA, phaseB) => phaseA.start_date - phaseB.start_date)[0];

  return { currentPhase, nextPhase };
};
