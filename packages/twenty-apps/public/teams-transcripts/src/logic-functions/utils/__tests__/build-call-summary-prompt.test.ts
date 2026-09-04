import { describe, expect, it } from 'vitest';

import { buildCallSummaryPrompt } from 'src/logic-functions/utils/build-call-summary-prompt.util';

describe('buildCallSummaryPrompt', () => {
  it('renders one timestamped line per entry under the title', () => {
    const prompt = buildCallSummaryPrompt({
      title: 'Kickoff',
      transcript: [
        {
          participant: { name: 'Ada' },
          words: [{ text: 'Hello', start_timestamp: { relative: 65 } }],
        },
        { participant: { name: '' }, words: [{ text: 'Hi' }] },
        { participant: { name: 'Ada' }, words: [{ text: '   ' }] },
      ],
    });

    expect(prompt).toBe(
      'Meeting title: Kickoff\n\nTranscript:\n[1:05] Ada: Hello\nSpeaker: Hi',
    );
  });

  it('returns undefined without usable entries', () => {
    expect(buildCallSummaryPrompt({ transcript: [] })).toBeUndefined();
    expect(buildCallSummaryPrompt({ transcript: 'nope' })).toBeUndefined();
  });
});
