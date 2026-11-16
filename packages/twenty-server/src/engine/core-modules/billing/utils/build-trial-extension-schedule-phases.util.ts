/* @license Enterprise */

import type Stripe from 'stripe';

import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';

// Stripe refuses a trial_end update on a scheduled subscription, so the trial phase is stretched instead
export const buildTrialExtensionSchedulePhases = ({
  currentPhase,
  nextPhase,
  trialEnd,
}: {
  currentPhase: Stripe.SubscriptionSchedule.Phase;
  nextPhase: Stripe.SubscriptionSchedule.Phase;
  trialEnd: number;
}): Stripe.SubscriptionScheduleUpdateParams.Phase[] => [
  {
    ...toPhaseUpdateParams(currentPhase),
    end_date: trialEnd,
    trial_end: trialEnd,
  },
  {
    ...toPhaseUpdateParams(nextPhase),
    start_date: trialEnd,
    end_date: undefined,
  },
];
