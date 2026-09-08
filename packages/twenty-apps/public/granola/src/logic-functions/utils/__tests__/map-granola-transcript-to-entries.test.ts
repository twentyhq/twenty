import { describe, expect, it } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { getGranolaNoteTimeRange } from 'src/logic-functions/utils/get-granola-note-time-range.util';
import { mapGranolaTranscriptToEntries } from 'src/logic-functions/utils/map-granola-transcript-to-entries.util';

describe('mapGranolaTranscriptToEntries', () => {
  it('anchors early speech at zero instead of the scheduled meeting start', () => {
    const note = buildGranolaNote({
      transcript: [
        buildGranolaTranscriptItem({
          start_time: '2026-09-05T09:55:00Z',
          end_time: '2026-09-05T09:55:02Z',
        }),
        buildGranolaTranscriptItem({
          start_time: '2026-09-05T09:55:05.250Z',
          end_time: '2026-09-05T09:55:07Z',
        }),
      ],
      calendar_event: {
        event_title: null,
        invitees: [],
        organiser: null,
        calendar_event_id: null,
        scheduled_start_time: '2026-09-05T10:00:00Z',
        scheduled_end_time: null,
      },
    });

    expect(
      mapGranolaTranscriptToEntries({
        transcript: note.transcript,
        owner: note.owner,
        startedAt: getGranolaNoteTimeRange(note).startedAt,
      }).map((entry) => entry.words[0].start_timestamp.relative),
    ).toEqual([0, 5.25]);
  });

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
