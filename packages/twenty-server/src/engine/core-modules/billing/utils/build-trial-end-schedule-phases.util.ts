/* @license Enterprise */

import type Stripe from 'stripe';

import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';

// Stripe refuses a trial_end update on a scheduled subscription, so the trial phase end is moved instead
export const buildTrialEndSchedulePhases = ({
  currentPhase,
  nextPhase,
  trialEnd,
}: {
  currentPhase: Stripe.SubscriptionSchedule.Phase;
  nextPhase: Stripe.SubscriptionSchedule.Phase;
  trialEnd: number | 'now';
}): Stripe.SubscriptionScheduleUpdateParams.Phase[] => [
  {
    ...toPhaseUpdateParams(currentPhase),
    end_date: trialEnd,
    trial_end: trialEnd,
  },
  {
    ...toPhaseUpdateParams(nextPhase),
    start_date: undefined,
    end_date: undefined,
  },
];
