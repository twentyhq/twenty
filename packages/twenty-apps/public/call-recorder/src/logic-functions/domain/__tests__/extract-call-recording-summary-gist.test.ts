import { describe, expect, it } from 'vitest';

import { extractCallRecordingSummaryGist } from 'src/logic-functions/domain/extract-call-recording-summary-gist.util';

describe('extractCallRecordingSummaryGist', () => {
  it('returns the sentence under the Gist heading', () => {
    expect(
      extractCallRecordingSummaryGist(
        '## Gist\nThe team agreed on the launch date.\n\n## Overview\nA short sync.',
      ),
    ).toBe('The team agreed on the launch date.');
  });

  it('joins a gist written on several lines', () => {
    expect(
      extractCallRecordingSummaryGist(
        '## Gist\n\nThe team agreed\non the launch date.\n',
      ),
    ).toBe('The team agreed on the launch date.');
  });

  it('turns brackets into parentheses so the gist cannot mention or link', () => {
    expect(
      extractCallRecordingSummaryGist(
        '## Gist\nSee [[record:workspaceMember:member-1:Ada]] and [the deck](https://example.com).',
      ),
    ).toBe(
      'See ((record:workspaceMember:member-1:Ada)) and (the deck)(https://example.com).',
    );
  });

  it.each([
    '## Overview\nA short sync.',
    '## Gist\n\n## Overview\nA short sync.',
    '',
  ])('returns nothing when the summary has no gist: %j', (summaryMarkdown) => {
    expect(extractCallRecordingSummaryGist(summaryMarkdown)).toBeUndefined();
  });
});
