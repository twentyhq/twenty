import { describe, expect, it } from 'vitest';

import { parsePartialDate } from 'src/logic-functions/utils/parse-partial-date';

describe('parsePartialDate', () => {
  it('expands a year to a full date', () => {
    expect(parsePartialDate('1990')).toBe('1990-01-01');
  });

  it('expands a year-month to a full date', () => {
    expect(parsePartialDate('2020-05')).toBe('2020-05-01');
  });

  it('keeps a full date', () => {
    expect(parsePartialDate('2020-05-17')).toBe('2020-05-17');
  });

  it('returns undefined for an unparseable value', () => {
    expect(parsePartialDate('not-a-date')).toBeUndefined();
    expect(parsePartialDate(undefined)).toBeUndefined();
  });

  it('rejects out-of-range or non-existent calendar dates', () => {
    expect(parsePartialDate('2020-13')).toBeUndefined();
    expect(parsePartialDate('2020-00-01')).toBeUndefined();
    expect(parsePartialDate('1990-02-31')).toBeUndefined();
    expect(parsePartialDate('2020-04-31')).toBeUndefined();
  });
});
