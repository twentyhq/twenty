import { describe, expect, it } from 'vitest';

import { toTeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/utils/to-teams-meeting-occurrence';

const JOIN_WEB_URL =
  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0';

const ORGANIZED_TEAMS_EVENT = {
  id: 'event-1',
  iCalUId: 'ical-event-1',
  isOrganizer: true,
  isCancelled: false,
  onlineMeetingProvider: 'teamsForBusiness',
  onlineMeeting: { joinUrl: JOIN_WEB_URL },
  start: { dateTime: '2026-09-05T10:00:00.0000000', timeZone: 'UTC' },
  end: { dateTime: '2026-09-05T10:30:00.0000000', timeZone: 'UTC' },
};

describe('toTeamsMeetingOccurrence', () => {
  it('should reference a single meeting by its own event id and iCalUId', () => {
    expect(toTeamsMeetingOccurrence(ORGANIZED_TEAMS_EVENT)).toEqual({
      joinWebUrl: JOIN_WEB_URL,
      startDateTime: '2026-09-05T10:00:00.000Z',
      endDateTime: '2026-09-05T10:30:00.000Z',
      calendarReference: {
        eventExternalId: 'event-1',
        iCalUId: 'ical-event-1',
      },
    });
  });

  it('should reference an occurrence of a recurring meeting by its series master', () => {
    expect(
      toTeamsMeetingOccurrence({
        ...ORGANIZED_TEAMS_EVENT,
        id: 'occurrence-1',
        iCalUId: 'ical-occurrence-1',
        seriesMasterId: 'series-master-1',
      })?.calendarReference,
    ).toEqual({ eventExternalId: 'series-master-1' });
  });

  it.each([
    ['not organized by the account', { isOrganizer: false }],
    ['cancelled', { isCancelled: true }],
    ['not a Teams meeting', { onlineMeetingProvider: 'skypeForBusiness' }],
    ['without a join URL', { onlineMeeting: null }],
    ['without an id', { id: undefined }],
    ['without an end', { end: null }],
  ])('should skip an event %s', (_, eventOverrides) => {
    expect(
      toTeamsMeetingOccurrence({ ...ORGANIZED_TEAMS_EVENT, ...eventOverrides }),
    ).toBeUndefined();
  });
});
