import { enUS } from 'date-fns/locale';

import { formatDateISOStringToRelativeDate } from '@/modules/localization/utils/formatDateISOStringToRelativeDate';

// ---------------------------------------------------------------------------
// Helper: build a "YYYY-MM-DD" string offset by N days from today in LOCAL time.
// This mirrors exactly what the server stores and what the bug was about.
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
// isDayMaximumPrecision = true  →  the Today / Yesterday / Tomorrow code path
// This is the path affected by issue #19634.
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
    // 5 days from now — should NOT be Today/Tomorrow/Yesterday
    const result = call(localDateOnly(5));
    expect(['Today', 'Tomorrow', 'Yesterday']).not.toContain(result);
    // date-fns formatDistance for 5 days ahead → "5 days"
    expect(result).toMatch(/5 days/);
  });

  // ---- Regression tests for the UTC-vs-local bug (issue #19634) -----------

  it('regression: tomorrow\'s date-only string must never resolve to "Today"', () => {
    // Before the fix, new Date("YYYY-MM-DD") was UTC midnight.
    // West of UTC that UTC midnight is still "today" in local time.
    expect(call(localDateOnly(1))).not.toBe('Today');
  });

  it('regression: today\'s date-only string must never resolve to "Yesterday"', () => {
    // East of UTC the inverse could apply.
    expect(call(localDateOnly(0))).not.toBe('Yesterday');
  });
});

// ---------------------------------------------------------------------------
// isDayMaximumPrecision = false  →  the formatDistance (datetime) code path
// Full ISO datetime strings carry their own timezone info; this path must
// be unaffected by the fix.
// ---------------------------------------------------------------------------
describe('formatDateISOStringToRelativeDate — full datetime strings', () => {
  it('handles a full UTC datetime string without throwing', () => {
    const isoFull = new Date().toISOString(); // e.g. "2026-04-15T10:30:00.000Z"
    expect(() => call(isoFull, false)).not.toThrow();
  });

  it('returns a relative string for a full datetime 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = call(twoHoursAgo, false);
    expect(result).toMatch(/hour/);
  });
});
