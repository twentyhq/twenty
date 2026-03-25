import { type Stripe } from 'stripe';

import { getSubscriptionPricesFromSchedulePhase } from 'src/engine/core-modules/billing/utils/get-subscription-prices-from-schedule-phase.util';

describe('getSubscriptionPricesFromSchedulePhase', () => {
  it('returns licensed price id, metered price id, and seats from phase with string prices', () => {
    const phase = {
      items: [
        { price: 'price_licensed_123', quantity: 10 },
        { price: 'price_metered_456', quantity: undefined },
      ],
    } as unknown as Stripe.SubscriptionSchedule.Phase;

    const result = getSubscriptionPricesFromSchedulePhase(phase);

    expect(result).toEqual({
      licensedPriceId: 'price_licensed_123',
      meteredPriceId: 'price_metered_456',
      seats: 10,
    });
  });

  it('returns licensed price id, metered price id, and seats from phase with object prices', () => {
    const phase = {
      items: [
        { price: { id: 'price_licensed_abc' }, quantity: 5 },
        { price: { id: 'price_metered_def' }, quantity: undefined },
      ],
    } as unknown as Stripe.SubscriptionSchedule.Phase;

    const result = getSubscriptionPricesFromSchedulePhase(phase);

    expect(result).toEqual({
      licensedPriceId: 'price_licensed_abc',
      meteredPriceId: 'price_metered_def',
      seats: 5,
    });
  });

  it('throws when no licensed item is found', () => {
    const phase = {
      items: [
        { price: 'price_metered_1', quantity: undefined },
        { price: 'price_metered_2', quantity: undefined },
      ],
    } as unknown as Stripe.SubscriptionSchedule.Phase;

    expect(() => getSubscriptionPricesFromSchedulePhase(phase)).toThrow();
  });

  it('throws when no metered item is found', () => {
    const phase = {
      items: [
        { price: 'price_licensed_1', quantity: 5 },
        { price: 'price_licensed_2', quantity: 10 },
      ],
    } as unknown as Stripe.SubscriptionSchedule.Phase;

    expect(() => getSubscriptionPricesFromSchedulePhase(phase)).toThrow();
  });

  it('throws when phase has no items', () => {
    const phase = {
      items: [],
    } as unknown as Stripe.SubscriptionSchedule.Phase;

    expect(() => getSubscriptionPricesFromSchedulePhase(phase)).toThrow();
  });
});
