import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_TEST_MEETING_WINDOW } from 'src/features/transcripts/__tests__/constants/teams-test-meeting-window.constant';
import { TEAMS_TEST_REQUESTER_CONTEXT } from 'src/features/transcripts/__tests__/constants/teams-test-requester-context.constant';
import { TEAMS_TEST_ROADMAP_JOIN_URL } from 'src/features/transcripts/__tests__/constants/teams-test-roadmap-join-url.constant';
import { addRoadmapMeeting } from 'src/features/transcripts/__tests__/utils/add-roadmap-meeting.util';
import { buildHourLongOccurrence } from 'src/features/transcripts/__tests__/utils/build-hour-long-occurrence.util';
import { setupTeamsIntegrationTest } from 'src/features/transcripts/__tests__/utils/setup-teams-integration-test.util';
import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/constants/teams.constant';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsListOrganizerTranscriptsHandler } from 'src/features/transcripts/logic-functions/teams-list-organizer-transcripts';

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: { IS_TRANSCRIPT_IMPORT_ENABLED: true },
}));

describe('List My Teams Transcripts', () => {
  const { graph } = setupTeamsIntegrationTest();

  beforeEach(() => {
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
  });

  describe('listing transcripts', () => {
    it('lists the transcripts of scheduled Teams meetings the account organizes', async () => {
      addRoadmapMeeting(graph);
      graph.addCalendarEvent({
        joinUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
        ...buildHourLongOccurrence('2026-09-17T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/attendee-only',
        isOrganizer: false,
        ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/cancelled',
        isCancelled: true,
        ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://zoom.us/j/123',
        onlineMeetingProvider: 'unknown',
        ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(result).toEqual({
        success: true,
        connectedAccount: 'organizer@example.com',
        isTruncated: false,
        transcripts: [
          {
            transcriptId: 'transcript-roadmap',
            meetingId: 'meeting-roadmap',
            subject: 'Roadmap review',
            createdDateTime: '2026-09-10T10:00:00Z',
          },
        ],
      });
      expect(graph.callsTo('/me/onlineMeetings')).toHaveLength(1);

      const [calendarCall] = graph.callsTo('/me/calendarView');
      const calendarUrl = new URL(calendarCall.url);

      expect(calendarCall.authorization).toBe(`Bearer ${graph.accessToken}`);
      expect(calendarUrl.searchParams.get('startDateTime')).toBe(
        TEAMS_TEST_MEETING_WINDOW.startDateTime,
      );
      expect(calendarUrl.searchParams.get('endDateTime')).toBe(
        TEAMS_TEST_MEETING_WINDOW.endDateTime,
      );
      expect(calendarUrl.searchParams.get('$top')).toBe(
        String(TEAMS_CALENDAR_PAGE_SIZE),
      );
      expect(calendarUrl.searchParams.get('$select')).toContain(
        'isOnlineMeeting',
      );
    });

    it('escapes apostrophes in the join URL before filtering meetings', async () => {
      const joinUrl = "https://teams.microsoft.com/l/meetup-join/it's-a-sync";

      graph.addMeeting({
        id: 'meeting-sync',
        joinWebUrl: joinUrl,
        subject: "It's a sync",
        transcripts: [
          { id: 'transcript-sync', createdDateTime: '2026-09-11T09:00:00Z' },
        ],
      });
      graph.addCalendarEvent({
        joinUrl,
        ...buildHourLongOccurrence('2026-09-11T08:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      const [meetingCall] = graph.callsTo('/me/onlineMeetings');

      expect(new URL(meetingCall.url).searchParams.get('$filter')).toBe(
        "JoinWebUrl eq 'https://teams.microsoft.com/l/meetup-join/it''s-a-sync'",
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [expect.objectContaining({ subject: "It's a sync" })],
        }),
      );
    });

    it('follows transcript pagination inside one meeting', async () => {
      graph.setTranscriptPageSize(1);
      graph.addMeeting({
        id: 'meeting-recurring',
        joinWebUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
        subject: 'Recurring',
        transcripts: [
          { id: 'transcript-1', createdDateTime: '2026-09-02T10:00:00Z' },
          { id: 'transcript-2', createdDateTime: '2026-09-09T10:00:00Z' },
          { id: 'transcript-3', createdDateTime: '2026-09-16T10:00:00Z' },
        ],
      });

      for (const startDateTime of [
        '2026-09-02T09:30:00Z',
        '2026-09-09T09:30:00Z',
        '2026-09-16T09:30:00Z',
      ]) {
        graph.addCalendarEvent({
          joinUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
          ...buildHourLongOccurrence(startDateTime),
        });
      }

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-1' }),
            expect.objectContaining({ transcriptId: 'transcript-2' }),
            expect.objectContaining({ transcriptId: 'transcript-3' }),
          ],
        }),
      );
      expect(
        graph.callsTo('/me/onlineMeetings/meeting-recurring/transcripts'),
      ).toHaveLength(3);
    });

    it('returns one calendar page at a time and continues from nextPageUrl', async () => {
      const planningJoinUrl =
        'https://teams.microsoft.com/l/meetup-join/planning';

      graph.setCalendarPageSize(1);
      addRoadmapMeeting(graph);
      graph.addMeeting({
        id: 'meeting-planning',
        joinWebUrl: planningJoinUrl,
        subject: 'Planning',
        transcripts: [
          {
            id: 'transcript-planning',
            createdDateTime: '2026-09-12T10:00:00Z',
          },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: planningJoinUrl,
        ...buildHourLongOccurrence('2026-09-12T09:30:00Z'),
      });

      const firstPage = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(firstPage).toEqual(
        expect.objectContaining({
          success: true,
          isTruncated: true,
          nextPageUrl: expect.stringContaining('%24skip=1'),
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-roadmap' }),
          ],
        }),
      );

      if (!firstPage.success) {
        throw new Error(firstPage.error);
      }

      const secondPage = await teamsListOrganizerTranscriptsHandler(
        { nextPageUrl: firstPage.nextPageUrl },
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(secondPage).toEqual(
        expect.objectContaining({
          success: true,
          isTruncated: false,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-planning' }),
          ],
        }),
      );
      expect(secondPage).not.toHaveProperty('nextPageUrl');
    });

    it('omits a missing subject and skips transcripts without a creation time', async () => {
      graph.addMeeting({
        id: 'meeting-bare',
        joinWebUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
        transcripts: [
          { id: 'transcript-dated', createdDateTime: '2026-09-10T10:00:00Z' },
          { id: 'transcript-undated' },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
        ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            {
              transcriptId: 'transcript-dated',
              meetingId: 'meeting-bare',
              createdDateTime: '2026-09-10T10:00:00Z',
            },
          ],
        }),
      );
    });
  });
});
