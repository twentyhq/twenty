/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { alignGrantExpiryToPeriodEnd } from 'src/engine/core-modules/billing/utils/align-grant-expiry-to-period-end.util';

const CURRENT_PERIOD_END = new Date('2026-02-01T00:00:00.000Z');

const alignFrom = (
  requestedExpiresAt: Date,
  interval = SubscriptionInterval.Month,
) =>
  alignGrantExpiryToPeriodEnd({
    requestedExpiresAt,
    currentPeriodEnd: CURRENT_PERIOD_END,
    interval,
  });

describe('alignGrantExpiryToPeriodEnd', () => {
  it('keeps a deadline inside the current period at its end', () => {
    expect(alignFrom(new Date('2026-01-20T00:00:00.000Z'))).toEqual(
      CURRENT_PERIOD_END,
    );
  });

  it('takes the period end a later deadline falls in', () => {
    expect(alignFrom(new Date('2026-03-15T00:00:00.000Z'))).toEqual(
      new Date('2026-04-01T00:00:00.000Z'),
    );
  });

  it('does not extend a deadline that already lands on a period end', () => {
    expect(alignFrom(new Date('2026-03-01T00:00:00.000Z'))).toEqual(
      new Date('2026-03-01T00:00:00.000Z'),
    );
  });

  it('walks yearly periods for a yearly subscription', () => {
    expect(
      alignFrom(
        new Date('2027-06-01T00:00:00.000Z'),
        SubscriptionInterval.Year,
      ),
    ).toEqual(new Date('2028-02-01T00:00:00.000Z'));
  });

  // Anchored on the 31st, the walk must not clamp its way backwards into a
  // period end that never reaches the requested day.
  it('keeps walking forward across a month-end anchor', () => {
    const result = alignGrantExpiryToPeriodEnd({
      requestedExpiresAt: new Date('2026-04-15T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-01-31T00:00:00.000Z'),
      interval: SubscriptionInterval.Month,
    });

    expect(result.getTime()).toBeGreaterThanOrEqual(
      new Date('2026-04-15T00:00:00.000Z').getTime(),
    );
  });

  it('gives up rather than looping on an unreachable deadline', () => {
    const result = alignFrom(new Date('2099-01-01T00:00:00.000Z'));

    expect(result.getTime()).toBeLessThan(
      new Date('2099-01-01T00:00:00.000Z').getTime(),
    );
  });
});
