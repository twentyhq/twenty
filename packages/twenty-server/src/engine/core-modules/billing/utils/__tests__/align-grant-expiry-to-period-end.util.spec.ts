/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { alignGrantExpiryToPeriodEnd } from 'src/engine/core-modules/billing/utils/align-grant-expiry-to-period-end.util';

const CURRENT_PERIOD_START = new Date('2026-01-01T00:00:00.000Z');
const CURRENT_PERIOD_END = new Date('2026-02-01T00:00:00.000Z');

const alignFrom = (
  requestedExpiresAt: Date,
  interval: SubscriptionInterval | null = SubscriptionInterval.Month,
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

  // Stripe re-expands a month-end anchor (Feb 28, Mar 31, Apr 30) rather than walking it down
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

  // The stored start is the clamped February date, so projecting straight off it would give Apr 28
  it('recovers a month-end anchor the stored period start no longer carries', () => {
    const result = alignGrantExpiryToPeriodEnd({
      requestedExpiresAt: new Date('2026-04-15T00:00:00.000Z'),
      currentPeriodStart: new Date('2026-02-28T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-03-31T00:00:00.000Z'),
      interval: SubscriptionInterval.Month,
    });

    expect(result).toEqual(new Date('2026-04-30T00:00:00.000Z'));
  });

  // A leap-day yearly anchor clamps to the 28th in common years and re-expands in leap ones
  it('keeps a leap-day yearly anchor on the day each year actually has', () => {
    const alignOnLeapDayAnchor = (requestedExpiresAt: Date) =>
      alignGrantExpiryToPeriodEnd({
        requestedExpiresAt,
        currentPeriodStart: new Date('2024-02-29T00:00:00.000Z'),
        currentPeriodEnd: new Date('2025-02-28T00:00:00.000Z'),
        interval: SubscriptionInterval.Year,
      });

    expect(alignOnLeapDayAnchor(new Date('2026-06-01T00:00:00.000Z'))).toEqual(
      new Date('2027-02-28T00:00:00.000Z'),
    );
    expect(alignOnLeapDayAnchor(new Date('2027-06-01T00:00:00.000Z'))).toEqual(
      new Date('2028-02-29T00:00:00.000Z'),
    );
  });

  // Feb 29 and Feb 28 anchors look alike between leap years; a day early beats a whole extra period
  it('reads an anchor it cannot tell apart as the earlier day', () => {
    const result = alignGrantExpiryToPeriodEnd({
      requestedExpiresAt: new Date('2027-06-01T00:00:00.000Z'),
      currentPeriodStart: new Date('2025-02-28T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-02-28T00:00:00.000Z'),
      interval: SubscriptionInterval.Year,
    });

    expect(result).toEqual(new Date('2028-02-28T00:00:00.000Z'));
  });

  // A null expiry fallback would hand out permanent credits for a time-boxed request
  it('stops at the current period end when the interval is unknown', () => {
    expect(alignFrom(new Date('2026-06-15T00:00:00.000Z'), null)).toEqual(
      CURRENT_PERIOD_END,
    );
  });

  it('gives up rather than looping on an unreachable deadline', () => {
    const result = alignFrom(new Date('2099-01-01T00:00:00.000Z'));

    expect(result.getTime()).toBeLessThan(
      new Date('2099-01-01T00:00:00.000Z').getTime(),
    );
  });

  // Stripe boundaries are UTC instants: local-time arithmetic lands the expiry inside the period
  describe.each(['Europe/Paris', 'Pacific/Kiritimati', 'America/Los_Angeles'])(
    'with the server in %s',
    (timeZone) => {
      const originalTimeZone = process.env.TZ;

      beforeAll(() => {
        process.env.TZ = timeZone;
      });

      afterAll(() => {
        // Assigning undefined would leave the string 'undefined' behind
        if (isDefined(originalTimeZone)) {
          process.env.TZ = originalTimeZone;
        } else {
          delete process.env.TZ;
        }
      });

      it('projects the boundary in UTC regardless', () => {
        expect(alignFrom(new Date('2026-03-15T00:00:00.000Z'))).toEqual(
          new Date('2026-04-01T00:00:00.000Z'),
        );
      });
    },
  );
});
