import { describe, expect, it } from 'vitest';

import { buildMeetCallSummaryPrompt } from 'src/logic-functions/utils/build-meet-call-summary-prompt.util';

describe('buildMeetCallSummaryPrompt', () => {
  it('should write one timestamped line per speaker turn under the title', () => {
    expect(
      buildMeetCallSummaryPrompt({
        title: 'Customer call',
        transcriptEntries: [
          {
            participant: { name: 'Alice Martin' },
            words: [
              { text: 'Hello, ', start_timestamp: { relative: 5 } },
              { text: 'welcome.', start_timestamp: { relative: 6 } },
            ],
          },
          {
            participant: { name: null },
            words: [{ text: 'Thanks.', start_timestamp: { relative: 3725 } }],
          },
          {
            participant: { name: 'Bob' },
            words: [{ text: ' ', start_timestamp: { relative: 3730 } }],
          },
        ],
      }),
    ).toBe(
      'Meeting title: Customer call\n\nTranscript:\n[0:05] Alice Martin: Hello, welcome.\n[1:02:05] Unknown speaker: Thanks.',
    );
  });

  it('should return nothing for a transcript without words', () => {
    expect(
      buildMeetCallSummaryPrompt({
        title: undefined,
        transcriptEntries: [],
      }),
    ).toBeUndefined();
  });
});
