/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { alignGrantExpiryToPeriodEnd } from 'src/engine/core-modules/billing/utils/align-grant-expiry-to-period-end.util';

const CURRENT_PERIOD_START = new Date('2026-01-01T00:00:00.000Z');
const CURRENT_PERIOD_END = new Date('2026-02-01T00:00:00.000Z');

const alignFrom = (
  requestedExpiresAt: Date,
  interval = SubscriptionInterval.Month,
) =>
  alignGrantExpiryToPeriodEnd({
    requestedExpiresAt,
    currentPeriodStart: CURRENT_PERIOD_START,
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
    ).toEqual(new Date('2028-01-01T00:00:00.000Z'));
  });

  // Stripe re-expands a month-end anchor rather than walking it down: a
  // subscription anchored on the 31st renews Feb 28, Mar 31, Apr 30. Stepping
  // off each clamped result instead would stamp the grant with Mar 28 and
  // Apr 28, dates the subscription never renews on, putting the deadline back
  // inside a period.
  it('keeps a month-end anchor on the days the subscription actually renews', () => {
    const alignOnMonthEndAnchor = (requestedExpiresAt: Date) =>
      alignGrantExpiryToPeriodEnd({
        requestedExpiresAt,
        currentPeriodStart: new Date('2026-01-31T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-02-28T00:00:00.000Z'),
        interval: SubscriptionInterval.Month,
      });

    expect(alignOnMonthEndAnchor(new Date('2026-02-20T00:00:00.000Z'))).toEqual(
      new Date('2026-02-28T00:00:00.000Z'),
    );
    expect(alignOnMonthEndAnchor(new Date('2026-03-15T00:00:00.000Z'))).toEqual(
      new Date('2026-03-31T00:00:00.000Z'),
    );
    expect(alignOnMonthEndAnchor(new Date('2026-04-15T00:00:00.000Z'))).toEqual(
      new Date('2026-04-30T00:00:00.000Z'),
    );
  });

  it('gives up rather than looping on an unreachable deadline', () => {
    const result = alignFrom(new Date('2099-01-01T00:00:00.000Z'));

    expect(result.getTime()).toBeLessThan(
      new Date('2099-01-01T00:00:00.000Z').getTime(),
    );
  });
});
