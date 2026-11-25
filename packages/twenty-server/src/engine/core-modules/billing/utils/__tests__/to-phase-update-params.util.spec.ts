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

const buildPhaseItem = (
  item: Pick<Stripe.SubscriptionSchedule.Phase.Item, 'price'> &
    Partial<Stripe.SubscriptionSchedule.Phase.Item>,
): Stripe.SubscriptionSchedule.Phase.Item => ({
  billing_thresholds: null,
  discounts: [],
  metadata: null,
  plan: 'plan_id',
  ...item,
});

describe('toPhaseUpdateParams', () => {
  it('normalizes a price object reference to its id', () => {
    const phase = toPhaseUpdateParams(
      buildPhase({
        items: [
          buildPhaseItem({
            price: { id: 'price_base', object: 'price', deleted: true },
            quantity: 3,
          }),
        ],
      }),
    );

    expect(phase.items).toEqual([{ price: 'price_base', quantity: 3 }]);
  });

  it('carries a null quantity through as undefined', () => {
    const phase = toPhaseUpdateParams(
      buildPhase({
        items: [
          buildPhaseItem({ price: 'price_metered', quantity: undefined }),
        ],
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

  describe('trial end', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-11-16T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('keeps a trial end that is still ahead', () => {
      const trialEnd = Date.parse('2026-12-16T00:00:00Z') / 1000;

      const phase = toPhaseUpdateParams(buildPhase({ trial_end: trialEnd }));

      expect(phase.trial_end).toBe(trialEnd);
    });

    it('omits a trial end that has passed', () => {
      const phase = toPhaseUpdateParams(
        buildPhase({ trial_end: Date.parse('2026-11-01T00:00:00Z') / 1000 }),
      );

      expect('trial_end' in phase).toBe(false);
    });

    it('omits the trial end when the phase has no trial', () => {
      const phase = toPhaseUpdateParams(buildPhase({ trial_end: null }));

      expect('trial_end' in phase).toBe(false);
    });
  });
});
