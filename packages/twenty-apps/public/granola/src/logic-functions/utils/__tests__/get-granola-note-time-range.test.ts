import { describe, expect, it } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { getGranolaNoteTimeRange } from 'src/logic-functions/utils/get-granola-note-time-range.util';

describe('getGranolaNoteTimeRange', () => {
  it('does not end a scheduled note without a transcript before its start', () => {
    const note = buildGranolaNote({
      created_at: '2026-09-04T10:00:00Z',
      calendar_event: {
        event_title: null,
        invitees: [],
        organiser: null,
        calendar_event_id: null,
        scheduled_start_time: '2026-09-05T10:00:00Z',
        scheduled_end_time: null,
      },
    });

    expect(getGranolaNoteTimeRange(note)).toEqual({
      startedAt: '2026-09-05T10:00:00Z',
      endedAt: '2026-09-05T10:00:00Z',
    });
  });

  it('uses creation time for a note with no scheduled times or transcript', () => {
    const note = buildGranolaNote();
    expect(getGranolaNoteTimeRange(note)).toEqual({
      startedAt: note.created_at,
      endedAt: note.created_at,
    });
  });

  it('prefers transcript boundaries over scheduled times so offsets start at zero', () => {
    const note = buildGranolaNote({
      transcript: [buildGranolaTranscriptItem()],
      calendar_event: {
        event_title: null,
        invitees: [],
        organiser: null,
        calendar_event_id: null,
        scheduled_start_time: '2026-09-05T10:00:00Z',
        scheduled_end_time: null,
      },
    });
    expect(getGranolaNoteTimeRange(note)).toEqual({
      startedAt: '2026-09-05T10:00:05Z',
      endedAt: '2026-09-05T10:00:07Z',
    });
  });
});
