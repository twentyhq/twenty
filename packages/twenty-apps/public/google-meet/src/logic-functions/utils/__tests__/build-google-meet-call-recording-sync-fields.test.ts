import { describe, expect, it } from 'vitest';

import { buildGoogleMeetCallRecordingSyncFields } from 'src/logic-functions/utils/build-google-meet-call-recording-sync-fields.util';

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
};

const TRANSCRIPT_ENTRIES = [
  {
    participant: { name: 'Alice Martin' },
    words: [{ text: 'Hello.', start_timestamp: { relative: 5 } }],
  },
];

describe('buildGoogleMeetCallRecordingSyncFields', () => {
  it('should build a completed recording linked to its calendar event', () => {
    expect(
      buildGoogleMeetCallRecordingSyncFields({
        conferenceRecord: CONFERENCE_RECORD,
        transcriptEntries: TRANSCRIPT_ENTRIES,
        calendarEvent: { id: 'calendar-event-id', title: ' Customer call ' },
      }),
    ).toEqual({
      title: 'Customer call',
      status: 'COMPLETED',
      externalRecordingId: 'conferenceRecords/first',
      startedAt: '2026-11-17T09:00:00Z',
      endedAt: '2026-11-17T09:30:00Z',
      transcript: TRANSCRIPT_ENTRIES,
      calendarEventId: 'calendar-event-id',
    });
  });

  it('should keep the recording processing while it has no transcript', () => {
    expect(
      buildGoogleMeetCallRecordingSyncFields({
        conferenceRecord: {
          name: 'conferenceRecords/first',
          startTime: '2026-11-17T09:00:00Z',
        },
        transcriptEntries: [],
        calendarEvent: undefined,
      }),
    ).toEqual({
      status: 'PROCESSING',
      externalRecordingId: 'conferenceRecords/first',
      startedAt: '2026-11-17T09:00:00Z',
    });
  });

  it('should leave the title out when the calendar event has none', () => {
    expect(
      buildGoogleMeetCallRecordingSyncFields({
        conferenceRecord: CONFERENCE_RECORD,
        transcriptEntries: TRANSCRIPT_ENTRIES,
        calendarEvent: { id: 'calendar-event-id', title: null },
      }),
    ).not.toHaveProperty('title');
  });
});
