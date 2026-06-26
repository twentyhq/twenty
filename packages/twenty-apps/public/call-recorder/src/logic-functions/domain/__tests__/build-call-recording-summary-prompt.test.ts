import { describe, expect, it } from 'vitest';

import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/build-call-recording-summary-prompt.util';

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'there' }],
  },
  {
    participant: { name: 'Sam' },
    words: [{ text: 'Hi' }, { text: 'Alex' }],
  },
];

describe('buildCallRecordingSummaryPrompt', () => {
  it('flattens entries into speaker-labelled lines', () => {
    expect(buildCallRecordingSummaryPrompt({ transcript: TRANSCRIPT })).toBe(
      'Transcript:\nAlex: Hello there\nSam: Hi Alex',
    );
  });

  it('includes the meeting title when provided', () => {
    expect(
      buildCallRecordingSummaryPrompt({
        transcript: TRANSCRIPT,
        title: 'Weekly sync',
      }),
    ).toBe('Meeting title: Weekly sync\n\nTranscript:\nAlex: Hello there\nSam: Hi Alex');
  });

  it('falls back to a placeholder speaker name', () => {
    expect(
      buildCallRecordingSummaryPrompt({
        transcript: [{ participant: {}, words: [{ text: 'Hey' }] }],
      }),
    ).toBe('Transcript:\nUnknown speaker: Hey');
  });

  it('skips entries without usable words', () => {
    expect(
      buildCallRecordingSummaryPrompt({
        transcript: [
          { participant: { name: 'Alex' }, words: [] },
          { participant: { name: 'Sam' }, words: [{ text: 'Real' }] },
        ],
      }),
    ).toBe('Transcript:\nSam: Real');
  });

  it('returns undefined when there is no usable dialogue', () => {
    expect(buildCallRecordingSummaryPrompt({ transcript: [] })).toBeUndefined();
    expect(
      buildCallRecordingSummaryPrompt({ transcript: { status: 'PENDING' } }),
    ).toBeUndefined();
    expect(
      buildCallRecordingSummaryPrompt({
        transcript: [{ participant: { name: 'A' }, words: [{ text: '  ' }] }],
      }),
    ).toBeUndefined();
  });
});
