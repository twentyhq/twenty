import { describe, expect, it } from 'vitest';

import { extractCallRecordingSummaryActionItems } from 'src/logic-functions/domain/extract-call-recording-summary-action-items.util';

describe('extractCallRecordingSummaryActionItems', () => {
  it('returns the action items with their owners', () => {
    expect(
      extractCallRecordingSummaryActionItems(
        '## Gist\nGood call.\n\n## Action Items\n**Alex**\n- Send the pricing deck\n\n**Unassigned**\n- Book the next call\n\n## Notes\n**Intro** — 0:00',
      ),
    ).toBe(
      '**Alex**\n- Send the pricing deck\n\n**Unassigned**\n- Book the next call',
    );
  });

  it('keeps numbered and starred items under their owner', () => {
    expect(
      extractCallRecordingSummaryActionItems(
        '## Action Items\n**Alex**\n1. Send the deck\n* Fix #123\n#123 is tracked\n\n## Notes',
      ),
    ).toBe('**Alex**\n1. Send the deck\n* Fix #123\n\n#123 is tracked');
  });

  it('turns brackets into parentheses so an owner name cannot link or mention', () => {
    expect(
      extractCallRecordingSummaryActionItems(
        '## Action Items\n**[Open the recording](https://evil.example)**\n- Ping [[record:workspaceMember:member-1:Ada]]',
      ),
    ).toBe(
      '**(Open the recording)(https://evil.example)**\n- Ping ((record:workspaceMember:member-1:Ada))',
    );
  });

  it.each([
    '## Gist\nGood call.\n\n## Action Items\nNone\n\n## Notes',
    '## Gist\nGood call.\n\n## Action Items\nNo action items.\n\n## Notes',
    '## Gist\nGood call.\n\n## Action Items\nNone.\n\n## Notes',
    '## Gist\nGood call.\n\n## Action Items\n\n## Notes',
    '## Gist\nGood call.',
  ])(
    'returns nothing when the call has no follow-up: %j',
    (summaryMarkdown) => {
      expect(
        extractCallRecordingSummaryActionItems(summaryMarkdown),
      ).toBeUndefined();
    },
  );
});
