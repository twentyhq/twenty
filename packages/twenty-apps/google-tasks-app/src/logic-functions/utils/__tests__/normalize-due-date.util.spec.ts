import { describe, expect, it } from 'vitest';
import { normalizeDueDate } from 'src/logic-functions/utils/normalize-due-date.util';

describe('normalizeDueDate', () => {
  it('returns null when Google sent no due date', () => {
    expect(normalizeDueDate(undefined)).toBeNull();
  });

  it('returns null for an unparseable due date', () => {
    expect(normalizeDueDate('not a date')).toBeNull();
  });

  it('pins a midnight due date to noon on the same calendar day', () => {
    expect(normalizeDueDate('2026-09-01T00:00:00.000Z')).toBe(
      '2026-09-01T12:00:00.000Z',
    );
  });

  it('keeps the calendar day when Google sends a bare date', () => {
    expect(normalizeDueDate('2026-09-01')).toBe('2026-09-01T12:00:00.000Z');
  });

  it('is idempotent on a value it already normalized', () => {
    expect(normalizeDueDate('2026-09-01T12:00:00.000Z')).toBe(
      '2026-09-01T12:00:00.000Z',
    );
  });
});
