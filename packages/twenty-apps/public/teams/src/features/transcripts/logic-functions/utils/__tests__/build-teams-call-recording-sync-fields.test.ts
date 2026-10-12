import { describe, expect, it } from 'vitest';

import { buildTeamsCallRecordingSyncFields } from 'src/features/transcripts/logic-functions/utils/build-teams-call-recording-sync-fields';

const TRANSCRIPT_ENTRY = {
  participant: { name: 'Alice Martin' },
  words: [{ text: 'Hello.', start_timestamp: { relative: 0 } }],
};

describe('buildTeamsCallRecordingSyncFields', () => {
  it('should build a completed recording linked to its calendar event', () => {
    expect(
      buildTeamsCallRecordingSyncFields({
        meeting: { subject: ' Weekly sync ' },
        transcript: {
          id: 'transcript-1',
          createdDateTime: '2026-09-05T10:02:00Z',
          endDateTime: '2026-09-05T10:31:00Z',
        },
        transcriptEntries: [TRANSCRIPT_ENTRY],
        calendarEventId: 'event-1',
      }),
    ).toEqual({
      title: 'Weekly sync',
      status: 'COMPLETED',
      externalRecordingId: 'transcript-1',
      startedAt: '2026-09-05T10:02:00Z',
      endedAt: '2026-09-05T10:31:00Z',
      transcript: [TRANSCRIPT_ENTRY],
      calendarEventId: 'event-1',
    });
  });

  it('should keep an empty transcript processing and leave missing values unset', () => {
    expect(
      buildTeamsCallRecordingSyncFields({
        meeting: { subject: '  ' },
        transcript: { id: 'transcript-1' },
        transcriptEntries: [],
      }),
    ).toEqual({
      status: 'PROCESSING',
      externalRecordingId: 'transcript-1',
    });
  });
});
