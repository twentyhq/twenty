import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_TEST_USER_WORKSPACE_ID } from 'src/features/transcripts/__tests__/constants/teams-test-user-workspace-id.constant';
import { buildTeamsAppConnection } from 'src/features/transcripts/__tests__/utils/build-teams-app-connection.util';
import { setupTeamsIntegrationTest } from 'src/features/transcripts/__tests__/utils/setup-teams-integration-test.util';
import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/constants/teams.constant';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsListOrganizerTranscriptsHandler } from 'src/features/transcripts/logic-functions/teams-list-organizer-transcripts';

const { featureFlags } = vi.hoisted(() => ({
  featureFlags: {
    IS_TRANSCRIPT_IMPORT_ENABLED: true,
  },
}));

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: featureFlags,
}));

const ROADMAP_JOIN_URL = 'https://teams.microsoft.com/l/meetup-join/roadmap';
const WEEKLY_JOIN_URL = 'https://teams.microsoft.com/l/meetup-join/weekly';
const requesterContext = { userWorkspaceId: TEAMS_TEST_USER_WORKSPACE_ID };
const window = {
  startDateTime: '2026-09-01T00:00:00.000Z',
  endDateTime: '2026-09-19T00:00:00.000Z',
};

const occurrenceAt = (startDateTime: string) => ({
  startDateTime,
  endDateTime: new Date(
    Date.parse(startDateTime) + 60 * 60 * 1_000,
  ).toISOString(),
});

describe('List My Teams Transcripts', () => {
  const { graph, appRuntime } = setupTeamsIntegrationTest();

  beforeEach(() => {
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
  });

  const addRoadmapMeeting = () => {
    graph.addMeeting({
      id: 'meeting-roadmap',
      joinWebUrl: ROADMAP_JOIN_URL,
      subject: 'Roadmap review',
      transcripts: [
        { id: 'transcript-roadmap', createdDateTime: '2026-09-10T10:00:00Z' },
      ],
    });
    graph.addCalendarEvent({
      joinUrl: ROADMAP_JOIN_URL,
      ...occurrenceAt('2026-09-10T09:30:00Z'),
    });
  };

  describe('feature availability', () => {
    it.each([
      { isAvailable: false, settingValue: 'true' },
      { isAvailable: false, settingValue: 'false' },
      { isAvailable: true, settingValue: 'false' },
      { isAvailable: true, settingValue: undefined },
      { isAvailable: true, settingValue: 'TRUE' },
    ])(
      'does not access connections or Graph with %o',
      async ({ isAvailable, settingValue }) => {
        featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = isAvailable;
        vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, settingValue);

        const result = await teamsListOrganizerTranscriptsHandler(
          window,
          requesterContext,
        );

        expect(result).toEqual({
          success: false,
          error: 'Teams transcripts are not enabled.',
        });
        expect(appRuntime.connectionRequestCount).toBe(0);
        expect(graph.calls).toHaveLength(0);
      },
    );
  });

  describe('listing transcripts', () => {
    it('lists the transcripts of scheduled Teams meetings the account organizes', async () => {
      addRoadmapMeeting();
      graph.addCalendarEvent({
        joinUrl: ROADMAP_JOIN_URL,
        ...occurrenceAt('2026-09-17T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/attendee-only',
        isOrganizer: false,
        ...occurrenceAt('2026-09-10T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/cancelled',
        isCancelled: true,
        ...occurrenceAt('2026-09-10T09:30:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: 'https://zoom.us/j/123',
        onlineMeetingProvider: 'unknown',
        ...occurrenceAt('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
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
        window.startDateTime,
      );
      expect(calendarUrl.searchParams.get('endDateTime')).toBe(
        window.endDateTime,
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
        ...occurrenceAt('2026-09-11T08:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
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
        joinWebUrl: ROADMAP_JOIN_URL,
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
          joinUrl: ROADMAP_JOIN_URL,
          ...occurrenceAt(startDateTime),
        });
      }

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
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
      addRoadmapMeeting();
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
        ...occurrenceAt('2026-09-12T09:30:00Z'),
      });

      const firstPage = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
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
        requesterContext,
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

    it('lists only the transcripts created during an occurrence in the window', async () => {
      graph.addMeeting({
        id: 'meeting-weekly',
        joinWebUrl: WEEKLY_JOIN_URL,
        subject: 'Weekly sync',
        transcripts: [
          {
            id: 'transcript-before-window',
            createdDateTime: '2026-08-27T10:05:00Z',
          },
          { id: 'transcript-week-1', createdDateTime: '2026-09-03T10:05:00Z' },
          {
            id: 'transcript-between-occurrences',
            createdDateTime: '2026-09-05T15:00:00Z',
          },
          {
            id: 'transcript-week-2-early',
            createdDateTime: '2026-09-10T09:50:00Z',
          },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...occurrenceAt('2026-09-03T10:00:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...occurrenceAt('2026-09-10T10:00:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-week-1' }),
            expect.objectContaining({
              transcriptId: 'transcript-week-2-early',
            }),
          ],
        }),
      );
    });

    it('lists each transcript of a recurring meeting on the page of its occurrence', async () => {
      graph.setCalendarPageSize(1);
      graph.addMeeting({
        id: 'meeting-weekly',
        joinWebUrl: WEEKLY_JOIN_URL,
        transcripts: [
          { id: 'transcript-week-1', createdDateTime: '2026-09-03T10:05:00Z' },
          { id: 'transcript-week-2', createdDateTime: '2026-09-10T10:05:00Z' },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...occurrenceAt('2026-09-03T10:00:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...occurrenceAt('2026-09-10T10:00:00Z'),
      });

      const firstPage = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(firstPage).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-week-1' }),
          ],
        }),
      );

      if (!firstPage.success) {
        throw new Error(firstPage.error);
      }

      const secondPage = await teamsListOrganizerTranscriptsHandler(
        { nextPageUrl: firstPage.nextPageUrl },
        requesterContext,
      );

      expect(secondPage).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-week-2' }),
          ],
        }),
      );
    });

    it('reads Graph event times as UTC whatever the server time zone', async () => {
      vi.stubEnv('TZ', 'Asia/Kolkata');
      addRoadmapMeeting();

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-roadmap' }),
          ],
        }),
      );
    });

    it('omits a missing subject and skips transcripts without a creation time', async () => {
      graph.addMeeting({
        id: 'meeting-bare',
        joinWebUrl: ROADMAP_JOIN_URL,
        transcripts: [
          { id: 'transcript-dated', createdDateTime: '2026-09-10T10:00:00Z' },
          { id: 'transcript-undated' },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: ROADMAP_JOIN_URL,
        ...occurrenceAt('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
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

    it('skips meetings Graph no longer returns for the join URL', async () => {
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/expired',
        ...occurrenceAt('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({ success: true, transcripts: [] }),
      );
    });

    it('skips a meeting Graph answers with 404 and keeps listing the others', async () => {
      const removedJoinUrl =
        'https://teams.microsoft.com/l/meetup-join/removed';

      graph.addMeeting({
        id: 'meeting-removed',
        joinWebUrl: removedJoinUrl,
        isExpired: true,
        transcripts: [
          { id: 'transcript-removed', createdDateTime: '2026-09-05T10:00:00Z' },
        ],
      });
      graph.addCalendarEvent({
        joinUrl: removedJoinUrl,
        ...occurrenceAt('2026-09-05T09:30:00Z'),
      });
      addRoadmapMeeting();

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-roadmap' }),
          ],
        }),
      );
    });
  });

  describe('choosing the connection', () => {
    it('uses the requester personal connection over another user connection', async () => {
      addRoadmapMeeting();
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: 'someone-elses-token',
          id: 'connected-account-teams-2',
          userWorkspaceId: 'user-workspace-2',
        }),
        buildTeamsAppConnection({ accessToken: graph.accessToken }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          connectedAccount: 'organizer@example.com',
        }),
      );
      expect(
        graph.calls.every(
          (call) => call.authorization === `Bearer ${graph.accessToken}`,
        ),
      ).toBe(true);
    });

    it('does not expose another user personal connection', async () => {
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: graph.accessToken,
          userWorkspaceId: 'user-workspace-2',
        }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('add a connection first'),
      });
      expect(graph.calls).toHaveLength(0);
    });

    it('falls back to a workspace-shared connection when nobody triggered the run', async () => {
      addRoadmapMeeting();
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: graph.accessToken,
          visibility: 'workspace',
          userWorkspaceId: 'user-workspace-2',
        }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(window, {
        userWorkspaceId: null,
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-roadmap' }),
          ],
        }),
      );
    });

    it('asks to reconnect when Microsoft authorization has failed', async () => {
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: graph.accessToken,
          authFailedAt: '2026-09-19T00:00:00Z',
          authFailedReason: 'invalid_grant',
        }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error: 'Reconnect Microsoft Teams in the app settings',
      });
      expect(graph.calls).toHaveLength(0);
    });
  });

  describe('talking to Microsoft Graph', () => {
    it.each([
      { startDateTime: 'not-a-date' },
      { startDateTime: window.endDateTime, endDateTime: window.startDateTime },
      { endDateTime: '2020-01-01T00:00:00Z' },
    ])('rejects the window %o before calling Graph', async (parameters) => {
      const result = await teamsListOrganizerTranscriptsHandler(
        parameters,
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error: 'Provide a valid startDateTime before endDateTime',
      });
      expect(graph.calls).toHaveLength(0);
    });

    it('never sends the token to a pagination URL outside Graph', async () => {
      const result = await teamsListOrganizerTranscriptsHandler(
        { nextPageUrl: 'https://example.com/v1.0/me/calendarView' },
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error: 'Microsoft Graph URLs must use graph.microsoft.com',
      });
      expect(graph.calls).toHaveLength(0);
    });

    it.each([
      'https://graph.microsoft.com/v1.0/me/messages',
      'https://graph.microsoft.com/v1.0/users/another-user/calendarView',
      'https://graph.microsoft.com/v1.0/me/calendarView/events',
      'https://graph.microsoft.com/v1.0/me/calendarView/../messages',
      'https://graph.microsoft.com/v1.0/me/calendarView%2F..%2Fmessages',
      'https://graph.microsoft.com/beta/me/calendarView',
    ])('rejects non-calendar pagination URL %s', async (nextPageUrl) => {
      const result = await teamsListOrganizerTranscriptsHandler(
        { nextPageUrl },
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error: 'Teams calendar pagination URLs must use /v1.0/me/calendarView',
      });
      expect(graph.calls).toHaveLength(0);
    });

    it.each([
      'https://graph.microsoft.com/v1.0/me/calendarView',
      'https://graph.microsoft.com/v1.0/me/calendarView/',
      '/v1.0/me/calendarView',
      'me/calendarView',
    ])('preserves continuation parameters for %s', async (calendarUrl) => {
      const query = '?%24skiptoken=next%2Bpage%2F%3D&%24top=10';
      const result = await teamsListOrganizerTranscriptsHandler(
        { nextPageUrl: `${calendarUrl}${query}` },
        requesterContext,
      );

      expect(result).toEqual({
        success: true,
        connectedAccount: 'organizer@example.com',
        isTruncated: false,
        transcripts: [],
      });
      expect(graph.calls).toHaveLength(1);
      expect(new URL(graph.calls[0].url).search).toBe(query);
    });

    it('retries a throttled request after the Retry-After delay', async () => {
      addRoadmapMeeting();
      graph.failNextCall({ status: 429, headers: { 'Retry-After': '1' } });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            expect.objectContaining({ transcriptId: 'transcript-roadmap' }),
          ],
        }),
      );
      expect(graph.callsTo('/me/calendarView')).toHaveLength(2);
    });

    it('surfaces the Graph inner error code without retrying', async () => {
      graph.failNextCall({
        status: 403,
        body: {
          error: {
            code: 'Forbidden',
            message: 'Transcript access is disabled',
            innerError: { code: 'GraphAccessToTranscriptsDisabled' },
          },
        },
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual({
        success: false,
        error:
          'Microsoft Graph request failed (403 GraphAccessToTranscriptsDisabled): Transcript access is disabled',
      });
      expect(graph.callsTo('/me/calendarView')).toHaveLength(1);
    });
  });
});
