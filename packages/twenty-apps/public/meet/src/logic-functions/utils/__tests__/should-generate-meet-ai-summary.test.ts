import { describe, expect, it } from 'vitest';

import { shouldGenerateMeetAiSummary } from 'src/logic-functions/utils/should-generate-meet-ai-summary.util';

const TRANSCRIPT_ENTRIES = [
  {
    participant: { name: 'Alice Martin' },
    words: [{ text: 'Hello.', start_timestamp: { relative: 5 } }],
  },
];

describe('shouldGenerateMeetAiSummary', () => {
  it('should summarize a transcript when Gemini took no notes', () => {
    expect(
      shouldGenerateMeetAiSummary({
        transcriptEntries: TRANSCRIPT_ENTRIES,
        summaryMarkdown: undefined,
        smartNotes: [],
      }),
    ).toBe(true);
  });

  it('should summarize when the generated Gemini notes could not be read', () => {
    expect(
      shouldGenerateMeetAiSummary({
        transcriptEntries: TRANSCRIPT_ENTRIES,
        summaryMarkdown: undefined,
        smartNotes: [{ state: 'FILE_GENERATED' }],
      }),
    ).toBe(true);
  });

  it('should wait for Gemini notes that are still being written', () => {
    expect(
      shouldGenerateMeetAiSummary({
        transcriptEntries: TRANSCRIPT_ENTRIES,
        summaryMarkdown: undefined,
        smartNotes: [{ state: 'ENDED' }],
      }),
    ).toBe(false);
  });

  it('should not summarize a call that has notes or no transcript', () => {
    expect(
      shouldGenerateMeetAiSummary({
        transcriptEntries: TRANSCRIPT_ENTRIES,
        summaryMarkdown: '## Summary',
        smartNotes: [{ state: 'FILE_GENERATED' }],
      }),
    ).toBe(false);
    expect(
      shouldGenerateMeetAiSummary({
        transcriptEntries: [],
        summaryMarkdown: undefined,
        smartNotes: [],
      }),
    ).toBe(false);
  });
});
