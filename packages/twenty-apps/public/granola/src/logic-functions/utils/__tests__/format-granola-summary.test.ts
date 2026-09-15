import { expect, it } from 'vitest';

import { formatGranolaSummary } from 'src/logic-functions/utils/format-granola-summary.util';

it('prefers shared markdown and falls back when it is absent or blank', () => {
  expect(
    formatGranolaSummary({
      summary_markdown: ' ## Decisions ',
      summary_text: 'Decisions',
    }),
  ).toBe('## Decisions');
  expect(
    formatGranolaSummary({
      summary_markdown: null,
      summary_text: ' Decisions ',
    }),
  ).toBe('Decisions');
  expect(
    formatGranolaSummary({ summary_markdown: '  ', summary_text: '' }),
  ).toBe('');
});
