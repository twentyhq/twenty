/* @license Enterprise */

import { findOrThrow, isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

export const getScheduleCurrentAndNextPhasesOrThrow = <
  TPhase extends Pick<Stripe.SubscriptionSchedule.Phase, 'start_date'>,
>(
  schedule: Pick<Stripe.SubscriptionSchedule, 'current_phase'> & {
    phases: TPhase[];
  },
): {
  currentPhase: TPhase;
  nextPhase: TPhase | undefined;
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
