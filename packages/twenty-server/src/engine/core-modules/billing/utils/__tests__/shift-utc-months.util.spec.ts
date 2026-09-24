/* @license Enterprise */

import { shiftUtcMonths } from 'src/engine/core-modules/billing/utils/shift-utc-months.util';

describe('shiftUtcMonths', () => {
  it('keeps the day the date already carries', () => {
    expect(
      shiftUtcMonths({ date: new Date('2026-01-15T00:00:00.000Z'), months: 1 }),
    ).toEqual(new Date('2026-02-15T00:00:00.000Z'));
  });

  it('clamps a day the target month does not have', () => {
    expect(
      shiftUtcMonths({ date: new Date('2026-01-31T00:00:00.000Z'), months: 1 }),
    ).toEqual(new Date('2026-02-28T00:00:00.000Z'));
  });

  it('clamps to the leap day when the target February has one', () => {
    expect(
      shiftUtcMonths({ date: new Date('2024-01-31T00:00:00.000Z'), months: 1 }),
    ).toEqual(new Date('2024-02-29T00:00:00.000Z'));
  });

  // The stored boundary has already been clamped, so the anchor has to be
  // re-applied rather than read off the date being shifted.
  it('applies an anchor day the date itself no longer carries', () => {
    expect(
      shiftUtcMonths({
        date: new Date('2026-02-28T00:00:00.000Z'),
        months: 1,
        dayOfMonth: 31,
      }),
    ).toEqual(new Date('2026-03-31T00:00:00.000Z'));
  });

  it('clamps the anchor again for a month that cannot hold it', () => {
    expect(
      shiftUtcMonths({
        date: new Date('2026-03-31T00:00:00.000Z'),
        months: 1,
        dayOfMonth: 31,
      }),
    ).toEqual(new Date('2026-04-30T00:00:00.000Z'));
  });

  it('steps backwards', () => {
    expect(
      shiftUtcMonths({
        date: new Date('2026-03-31T00:00:00.000Z'),
        months: -1,
      }),
    ).toEqual(new Date('2026-02-28T00:00:00.000Z'));
  });

  it('rolls a month index past either end of the year', () => {
    expect(
      shiftUtcMonths({ date: new Date('2026-12-15T00:00:00.000Z'), months: 1 }),
    ).toEqual(new Date('2027-01-15T00:00:00.000Z'));
    expect(
      shiftUtcMonths({
        date: new Date('2026-01-15T00:00:00.000Z'),
        months: -1,
      }),
    ).toEqual(new Date('2025-12-15T00:00:00.000Z'));
  });

  it('shifts a year as twelve months', () => {
    expect(
      shiftUtcMonths({
        date: new Date('2026-06-15T00:00:00.000Z'),
        months: 12,
      }),
    ).toEqual(new Date('2027-06-15T00:00:00.000Z'));
    expect(
      shiftUtcMonths({
        date: new Date('2024-02-29T00:00:00.000Z'),
        months: -12,
      }),
    ).toEqual(new Date('2023-02-28T00:00:00.000Z'));
  });

  // Stripe's boundaries are instants, not dates, and a subscription anchored
  // mid-day hands over at that time of day in every period.
  it('carries the time of day through the shift', () => {
    expect(
      shiftUtcMonths({ date: new Date('2026-01-15T09:41:07.123Z'), months: 1 }),
    ).toEqual(new Date('2026-02-15T09:41:07.123Z'));
  });

  describe.each(['Europe/Paris', 'Pacific/Kiritimati'])(
    'with the server in %s',
    (timeZone) => {
      const originalTimeZone = process.env.TZ;

      beforeAll(() => {
        process.env.TZ = timeZone;
      });

      afterAll(() => {
        if (originalTimeZone === undefined) {
          delete process.env.TZ;
        } else {
          process.env.TZ = originalTimeZone;
        }
      });

      it('answers in UTC regardless', () => {
        expect(
          shiftUtcMonths({
            date: new Date('2026-01-01T00:00:00.000Z'),
            months: 3,
          }),
        ).toEqual(new Date('2026-04-01T00:00:00.000Z'));
      });
    },
  );
});
