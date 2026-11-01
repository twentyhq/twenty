import { describe, expect, it } from 'vitest';

import { findTeamsTranscriptCalendarReference } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-reference';

const JOIN_WEB_URL =
  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0';

const MONDAY_OCCURRENCE = {
  joinWebUrl: JOIN_WEB_URL,
  startDateTime: '2026-09-07T10:00:00.000Z',
  endDateTime: '2026-09-07T10:30:00.000Z',
  calendarReference: { eventExternalId: 'series-master-1' },
};

const TUESDAY_OCCURRENCE = {
  joinWebUrl: JOIN_WEB_URL,
  startDateTime: '2026-09-08T10:00:00.000Z',
  endDateTime: '2026-09-08T10:30:00.000Z',
  calendarReference: { eventExternalId: 'event-2', iCalUId: 'ical-event-2' },
};

describe('findTeamsTranscriptCalendarReference', () => {
  it('should return the reference of the only occurrence around the transcript start', () => {
    expect(
      findTeamsTranscriptCalendarReference({
        transcript: { createdDateTime: '2026-09-08T09:50:00Z' },
        occurrences: [MONDAY_OCCURRENCE, TUESDAY_OCCURRENCE],
      }),
    ).toEqual({ eventExternalId: 'event-2', iCalUId: 'ical-event-2' });
  });

  it('should return nothing when no occurrence or several occurrences match', () => {
    expect(
      findTeamsTranscriptCalendarReference({
        transcript: { createdDateTime: '2026-09-09T10:00:00Z' },
        occurrences: [MONDAY_OCCURRENCE, TUESDAY_OCCURRENCE],
      }),
    ).toBeUndefined();
    expect(
      findTeamsTranscriptCalendarReference({
        transcript: { createdDateTime: '2026-09-08T10:05:00Z' },
        occurrences: [TUESDAY_OCCURRENCE, TUESDAY_OCCURRENCE],
      }),
    ).toBeUndefined();
  });
});
