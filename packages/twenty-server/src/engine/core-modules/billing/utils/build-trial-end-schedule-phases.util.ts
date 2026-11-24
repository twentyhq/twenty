/* @license Enterprise */

import type Stripe from 'stripe';

export const buildTrialEndSchedulePhases = ({
  currentPhase,
  nextPhase,
  trialEnd,
}: {
  currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  nextPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  trialEnd: number | 'now';
}): Stripe.SubscriptionScheduleUpdateParams.Phase[] => [
  { ...currentPhase, end_date: trialEnd, trial_end: trialEnd },
  { ...nextPhase, start_date: undefined, end_date: undefined },
];
