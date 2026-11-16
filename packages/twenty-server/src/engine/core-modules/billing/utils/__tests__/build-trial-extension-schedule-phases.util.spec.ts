/* @license Enterprise */

import type Stripe from 'stripe';

import { buildTrialExtensionSchedulePhases } from 'src/engine/core-modules/billing/utils/build-trial-extension-schedule-phases.util';

const TRIAL_START = Date.parse('2026-11-01T00:00:00Z') / 1000;
const TRIAL_END = Date.parse('2026-12-01T00:00:00Z') / 1000;
const NEXT_PHASE_END = Date.parse('2027-01-01T00:00:00Z') / 1000;
const EXTENDED_TRIAL_END = Date.parse('2026-12-15T00:00:00Z') / 1000;

const buildPhase = (
  phase: Partial<Stripe.SubscriptionSchedule.Phase>,
): Stripe.SubscriptionSchedule.Phase =>
  ({
    billing_thresholds: null,
    trial_end: null,
    ...phase,
  }) as Stripe.SubscriptionSchedule.Phase;

const buildItem = (price: string): Stripe.SubscriptionSchedule.Phase.Item =>
  ({ price, quantity: 1 }) as Stripe.SubscriptionSchedule.Phase.Item;

describe('buildTrialExtensionSchedulePhases', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-16T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stretches the trial phase and starts the next phase at the new trial end', () => {
    const [trialPhase, nextPhase] = buildTrialExtensionSchedulePhases({
      currentPhase: buildPhase({
        start_date: TRIAL_START,
        end_date: TRIAL_END,
        trial_end: TRIAL_END,
        items: [buildItem('price_pro_monthly')],
      }),
      nextPhase: buildPhase({
        start_date: TRIAL_END,
        end_date: NEXT_PHASE_END,
        items: [buildItem('price_credit_pack_small')],
      }),
      trialEnd: EXTENDED_TRIAL_END,
    });

    expect(trialPhase).toMatchObject({
      start_date: TRIAL_START,
      end_date: EXTENDED_TRIAL_END,
      trial_end: EXTENDED_TRIAL_END,
      items: [{ price: 'price_pro_monthly', quantity: 1 }],
    });
    expect(nextPhase).toMatchObject({
      start_date: EXTENDED_TRIAL_END,
      items: [{ price: 'price_credit_pack_small', quantity: 1 }],
    });
    expect(nextPhase.end_date).toBeUndefined();
    expect(nextPhase.trial_end).toBeUndefined();
  });
});
