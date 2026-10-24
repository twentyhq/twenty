/* @license Enterprise */

import type Stripe from 'stripe';

import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';

const buildPhase = (
  phase: Partial<
    Omit<Stripe.SubscriptionSchedule.Phase, 'end_date'> & {
      end_date: number | null;
    }
  >,
): Stripe.SubscriptionSchedule.Phase =>
  ({
    start_date: 1_700_000_000,
    end_date: 1_800_000_000,
    items: [],
    ...phase,
  }) as Stripe.SubscriptionSchedule.Phase;

describe('toPhaseUpdateParams', () => {
  it('normalizes a price object reference to its id', () => {
    const phase = toPhaseUpdateParams(
      buildPhase({
        items: [
          { price: { id: 'price_base' }, quantity: 3 },
        ] as unknown as Stripe.SubscriptionSchedule.Phase['items'],
      }),
    );

    expect(phase.items).toEqual([{ price: 'price_base', quantity: 3 }]);
  });

  it('carries a null quantity through as undefined', () => {
    const phase = toPhaseUpdateParams(
      buildPhase({
        items: [
          { price: 'price_metered', quantity: null },
        ] as unknown as Stripe.SubscriptionSchedule.Phase['items'],
      }),
    );

    expect(phase.items).toEqual([
      { price: 'price_metered', quantity: undefined },
    ]);
  });

  it('omits billing thresholds when the phase carries none', () => {
    const phase = toPhaseUpdateParams(buildPhase({ billing_thresholds: null }));

    expect('billing_thresholds' in phase).toBe(false);
  });

  it('keeps billing thresholds when the phase carries them', () => {
    const billingThresholds = {
      amount_gte: 1000,
      reset_billing_cycle_anchor: null,
    } as Stripe.SubscriptionSchedule.Phase['billing_thresholds'];

    const phase = toPhaseUpdateParams(
      buildPhase({ billing_thresholds: billingThresholds }),
    );

    expect(phase.billing_thresholds).toEqual(billingThresholds);
    expect(phase.proration_behavior).toBe('none');
  });

  it('turns a null end date into undefined', () => {
    const phase = toPhaseUpdateParams(buildPhase({ end_date: null }));

    expect(phase.end_date).toBeUndefined();
  });

  it('keeps the trial end so a rewrite does not end the trial', () => {
    const phase = toPhaseUpdateParams(buildPhase({ trial_end: 1_750_000_000 }));

    expect(phase.trial_end).toBe(1_750_000_000);
  });

  it('omits the trial end when the phase is not a trial', () => {
    const phase = toPhaseUpdateParams(buildPhase({ trial_end: null }));

    expect('trial_end' in phase).toBe(false);
  });
});
