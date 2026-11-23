/* @license Enterprise */

import type Stripe from 'stripe';

import { buildTrialEndSchedulePhases } from 'src/engine/core-modules/billing/utils/build-trial-end-schedule-phases.util';

const TRIAL_START = Date.parse('2026-11-01T00:00:00Z') / 1000;
const TRIAL_END = Date.parse('2026-12-01T00:00:00Z') / 1000;
const NEXT_PHASE_END = Date.parse('2027-01-01T00:00:00Z') / 1000;
const EXTENDED_TRIAL_END = Date.parse('2026-12-15T00:00:00Z') / 1000;

const TRIAL_PHASE: Stripe.SubscriptionScheduleUpdateParams.Phase = {
  start_date: TRIAL_START,
  end_date: TRIAL_END,
  trial_end: TRIAL_END,
  items: [{ price: 'price_pro_monthly', quantity: 1 }],
  proration_behavior: 'none',
};

const NEXT_PHASE: Stripe.SubscriptionScheduleUpdateParams.Phase = {
  start_date: TRIAL_END,
  end_date: NEXT_PHASE_END,
  items: [{ price: 'price_credit_pack_small', quantity: 1 }],
  proration_behavior: 'none',
};

describe('buildTrialEndSchedulePhases', () => {
  it('moves the trial phase end and lets the next phase follow it', () => {
    const [trialPhase, nextPhase] = buildTrialEndSchedulePhases({
      currentPhase: TRIAL_PHASE,
      nextPhase: NEXT_PHASE,
      trialEnd: EXTENDED_TRIAL_END,
    });

    expect(trialPhase).toEqual({
      ...TRIAL_PHASE,
      end_date: EXTENDED_TRIAL_END,
      trial_end: EXTENDED_TRIAL_END,
    });
    expect(nextPhase).toEqual({
      ...NEXT_PHASE,
      start_date: undefined,
      end_date: undefined,
    });
  });

  it('ends the trial phase now so the next phase starts right away', () => {
    const [trialPhase, nextPhase] = buildTrialEndSchedulePhases({
      currentPhase: TRIAL_PHASE,
      nextPhase: NEXT_PHASE,
      trialEnd: 'now',
    });

    expect(trialPhase).toMatchObject({
      start_date: TRIAL_START,
      end_date: 'now',
      trial_end: 'now',
    });
    expect(nextPhase.start_date).toBeUndefined();
  });
});
