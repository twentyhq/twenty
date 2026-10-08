import { describe, expect, it } from 'vitest';

import { parseBackfillDays } from 'src/front-components/utils/parse-backfill-days.util';

describe('parseBackfillDays', () => {
  it('parses a positive integer', () => {
    expect(parseBackfillDays('90')).toBe(90);
  });

  it('parses a padded value', () => {
    expect(parseBackfillDays(' 30 ')).toBe(30);
  });

  it('accepts the maximum window', () => {
    expect(parseBackfillDays('3650')).toBe(3650);
  });

  it.each([['0'], ['-5'], ['1.5'], ['abc'], [''], ['3651']])(
    'rejects %s',
    (rawValue) => {
      expect(parseBackfillDays(rawValue)).toBeUndefined();
    },
  );
});
