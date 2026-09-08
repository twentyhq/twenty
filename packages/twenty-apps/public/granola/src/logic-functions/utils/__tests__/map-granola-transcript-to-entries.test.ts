import { describe, expect, it } from 'vitest';

import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { mapGranolaTranscriptToEntries } from 'src/logic-functions/utils/map-granola-transcript-to-entries.util';

describe('mapGranolaTranscriptToEntries', () => {
  it('resolves identified speakers, owner attribution, anonymous iOS labels and unknown speakers', () => {
    const transcript = [
      buildGranolaTranscriptItem({
        speaker: { source: 'speaker', name: ' Bob ', attribution: 'me' },
      }),
      buildGranolaTranscriptItem(),
      buildGranolaTranscriptItem({
        speaker: { source: 'microphone', diarization_label: 'Speaker A' },
      }),
      buildGranolaTranscriptItem({ speaker: { source: 'speaker' } }),
    ];

    expect(
      mapGranolaTranscriptToEntries({
        transcript,
        owner: { name: null, email: 'alice@example.com' },
        startedAt: '2026-09-05T10:00:00Z',
      }).map((entry) => entry.participant.name),
    ).toEqual(['Bob', 'alice@example.com', 'Speaker A', 'Participant']);
  });

  it('preserves fractional offsets and skips whitespace-only speech', () => {
    const transcript = [
      buildGranolaTranscriptItem({
        text: ' Hello ',
        start_time: '2026-09-05T10:00:05.250Z',
      }),
      buildGranolaTranscriptItem({ text: '  ' }),
    ];

    expect(
      mapGranolaTranscriptToEntries({
        transcript,
        owner: { name: 'Alice', email: 'alice@example.com' },
        startedAt: '2026-09-05T10:00:00Z',
      }),
    ).toEqual([
      {
        participant: { name: 'Alice' },
        words: [{ text: 'Hello', start_timestamp: { relative: 5.25 } }],
      },
    ]);
  });
});
