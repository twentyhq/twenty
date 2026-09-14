import { describe, expect, it } from 'vitest';

import { parseHistoryImportDays } from 'src/front-components/utils/parse-history-import-days.util';

describe('parseHistoryImportDays', () => {
  it.each([
    { text: '1', days: 1 },
    { text: '3650', days: 3650 },
    { text: ' 31 ', days: 31 },
  ])('accepts $text as $days days', ({ text, days }) => {
    expect(parseHistoryImportDays(text)).toBe(days);
  });

  it.each([
    '',
    ' ',
    '0',
    '-1',
    '3651',
    '1.5',
    '31days',
    '1e2',
    '0x1f',
    'Infinity',
  ])('rejects %j instead of silently importing another date range', (text) => {
    expect(parseHistoryImportDays(text)).toBeUndefined();
  });
});
