import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFirefliesBackfillDays } from 'src/logic-functions/utils/get-fireflies-backfill-days';

describe('getFirefliesBackfillDays', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to 90 days when the variable is unset', () => {
    expect(getFirefliesBackfillDays()).toBe(90);
  });

  it('parses a configured number of days', () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '30');

    expect(getFirefliesBackfillDays()).toBe(30);
  });

  it('returns 0 for the disable value', () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '0');

    expect(getFirefliesBackfillDays()).toBe(0);
  });

  it('falls back to the default for an unparseable value', () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', 'ninety');

    expect(getFirefliesBackfillDays()).toBe(90);
  });

  it('falls back to the default for a blank value', () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '   ');

    expect(getFirefliesBackfillDays()).toBe(90);
  });

  it('floors fractional values', () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '7.9');

    expect(getFirefliesBackfillDays()).toBe(7);
  });
});
