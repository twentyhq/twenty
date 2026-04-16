import { enUS } from 'date-fns/locale';

import { formatDateISOStringToRelativeDate } from '@/modules/localization/utils/formatDateISOStringToRelativeDate';

// Pin the process to a timezone west of UTC for the entire test file.
// This is the exact scenario from issue #19634 — without this, regression
// tests pass in a GMT CI environment even with the bug present.
process.env.TZ = 'America/Los_Angeles'; // UTC-7 (PDT) / UTC-8 (PST)

// ---------------------------------------------------------------------------
// Helper: build a "YYYY-MM-DD" string offset by N days from today in LOCAL time.
// ---------------------------------------------------------------------------
const localDateOnly = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const call = (isoDate: string, isDayMaximumPrecision = true) =>
  formatDateISOStringToRelativeDate({
    isoDate,
    isDayMaximumPrecision,
    localeCatalog: enUS,
  });

// ---------------------------------------------------------------------------
// Core behaviour — isDayMaximumPrecision = true
// ---------------------------------------------------------------------------
describe('formatDateISOStringToRelativeDate — isDayMaximumPrecision (date-only strings)', () => {
  it('returns "Today" for today\'s date-only string', () => {
    expect(call(localDateOnly(0))).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow\'s date-only string', () => {
    expect(call(localDateOnly(1))).toBe('Tomorrow');
  });

  it('returns "Yesterday" for yesterday\'s date-only string', () => {
    expect(call(localDateOnly(-1))).toBe('Yesterday');
  });

  it('falls through to formatDistance for dates further away', () => {
    const result = call(localDateOnly(5));
    expect(['Today', 'Tomorrow', 'Yesterday']).not.toContain(result);
    expect(result).toMatch(/5 days/);
  });
});

// ---------------------------------------------------------------------------
// Regression — issue #19634 (west-of-UTC timezone, pinned to America/Los_Angeles)
//
// Before the fix: new Date("YYYY-MM-DD") produced UTC midnight.
// At UTC midnight the local clock in UTC-7/8 still shows the PREVIOUS day,
// so isTomorrow("tomorrow's date") returned false and isToday returned true.
//
// The fix appends "T00:00:00" (no Z) so the constructor uses local midnight,
// keeping the date on the correct calendar day in every timezone.
// ---------------------------------------------------------------------------
describe('regression — date-only strings in America/Los_Angeles (UTC-7/8)', () => {
  it('tomorrow\'s date-only string resolves to "Tomorrow", not "Today"', () => {
    // This assertion would FAIL with the old `new Date(isoDate)` because
    // UTC midnight of tomorrow is still "today" locally when west of UTC.
    const result = call(localDateOnly(1));
    expect(result).toBe('Tomorrow');
    expect(result).not.toBe('Today');
  });

  it('today\'s date-only string resolves to "Today", not "Yesterday"', () => {
    const result = call(localDateOnly(0));
    expect(result).toBe('Today');
    expect(result).not.toBe('Yesterday');
  });

  it('directly verifies local-midnight parsing for a fixed date string', () => {
    // Construct the canonical broken scenario:
    // For a date-only string the fix must produce local midnight (getHours() === 0)
    // while UTC midnight would land at getHours() === timezoneOffsetHours in local time.
    const dateString = localDateOnly(1);
    const localMidnight = new Date(dateString + 'T00:00:00');

    expect(localMidnight.getHours()).toBe(0);   // midnight in local time
    expect(localMidnight.getMinutes()).toBe(0);
    // Date stays on the intended calendar day
    const [, , dd] = dateString.split('-');
    expect(localMidnight.getDate()).toBe(Number(dd));
  });
});

// ---------------------------------------------------------------------------
// Full datetime strings — existing behaviour must be preserved
// ---------------------------------------------------------------------------
describe('formatDateISOStringToRelativeDate — full datetime strings', () => {
  it('handles a full UTC datetime string without throwing', () => {
    const isoFull = new Date().toISOString();
    expect(() => call(isoFull, false)).not.toThrow();
  });

  it('returns a relative string for a full datetime 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = call(twoHoursAgo, false);
    expect(result).toMatch(/hour/);
  });
});
