/* @license Enterprise */

import { addLiveDiscountsToSchedulePhases } from 'src/engine/core-modules/billing/utils/add-live-discounts-to-schedule-phases.util';

const CURRENT_START = 1_790_000_000;
const PERIOD_END = 1_800_000_000;

const currentPhase = {
  start_date: CURRENT_START,
  end_date: PERIOD_END,
  items: [{ price: 'price_base', quantity: 3 }],
};

const nextPhase = {
  start_date: PERIOD_END,
  items: [{ price: 'price_base', quantity: 2 }],
};

describe('addLiveDiscountsToSchedulePhases', () => {
  it('reuses every live discount by id on the current phase, and on the next one only those still running when it starts', () => {
    expect(
      addLiveDiscountsToSchedulePhases({
        phases: [currentPhase, nextPhase],
        subscriptionDiscounts: [
          { id: 'di_forever', end: null },
          { id: 'di_one_month', end: PERIOD_END - 1 },
          { id: 'di_two_years', end: PERIOD_END + 1 },
        ],
      }).map(({ discounts }) => discounts),
    ).toEqual([
      [
        { discount: 'di_forever' },
        { discount: 'di_one_month' },
        { discount: 'di_two_years' },
      ],
      [{ discount: 'di_forever' }, { discount: 'di_two_years' }],
    ]);
  });

  it('reads the start of a phase that follows the previous one from its end date', () => {
    const [, followingPhase] = addLiveDiscountsToSchedulePhases({
      phases: [
        currentPhase,
        { ...nextPhase, start_date: undefined, end_date: undefined },
      ],
      subscriptionDiscounts: [{ id: 'di_one_month', end: PERIOD_END - 1 }],
    });

    expect('discounts' in followingPhase).toBe(false);
  });

  it('keeps live discounts on a phase that starts now', () => {
    const [endingPhase, followingPhase] = addLiveDiscountsToSchedulePhases({
      phases: [
        { ...currentPhase, end_date: 'now' },
        { ...nextPhase, start_date: undefined, end_date: undefined },
      ],
      subscriptionDiscounts: [{ id: 'di_one_month', end: PERIOD_END - 1 }],
    });

    expect(endingPhase.discounts).toEqual([{ discount: 'di_one_month' }]);
    expect(followingPhase.discounts).toEqual([{ discount: 'di_one_month' }]);
  });

  it('sets no discounts when the subscription has none, so a customer discount still applies', () => {
    expect(
      addLiveDiscountsToSchedulePhases({
        phases: [currentPhase, nextPhase],
        subscriptionDiscounts: [],
      }),
    ).toEqual([currentPhase, nextPhase]);
  });
});
