import { describe, expect, it } from 'vitest';

import { TEAMS_TEST_USER_WORKSPACE_ID } from 'src/__tests__/constants/teams-test-user-workspace-id.constant';
import { buildTeamsAppConnection } from 'src/__tests__/utils/build-teams-app-connection.util';
import { setupTeamsIntegrationTest } from 'src/__tests__/utils/setup-teams-integration-test.util';
import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/constants/teams.constant';
import { teamsListOrganizerTranscriptsHandler } from 'src/logic-functions/teams-list-organizer-transcripts';

const ROADMAP_JOIN_URL = 'https://teams.microsoft.com/l/meetup-join/roadmap';
const requesterContext = { userWorkspaceId: TEAMS_TEST_USER_WORKSPACE_ID };
const window = {
  startDateTime: '2026-09-01T00:00:00.000Z',
  endDateTime: '2026-09-19T00:00:00.000Z',
};

describe('List My Teams Transcripts', () => {
  const { graph, appRuntime } = setupTeamsIntegrationTest();

  const addRoadmapMeeting = () => {
    graph.addMeeting({
      id: 'meeting-roadmap',
      joinWebUrl: ROADMAP_JOIN_URL,
      subject: 'Roadmap review',
      transcripts: [
        { id: 'transcript-roadmap', createdDateTime: '2026-09-10T10:00:00Z' },
      ],
    });
    graph.addCalendarEvent({ joinUrl: ROADMAP_JOIN_URL });
  };

  describe('listing transcripts', () => {
    it('lists the transcripts of scheduled Teams meetings the account organizes', async () => {
      addRoadmapMeeting();
      graph.addCalendarEvent({ joinUrl: ROADMAP_JOIN_URL });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/attendee-only',
        isOrganizer: false,
      });
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/cancelled',
        isCancelled: true,
      });
      graph.addCalendarEvent({
        joinUrl: 'https://zoom.us/j/123',
        onlineMeetingProvider: 'unknown',
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
      graph.addCalendarEvent({ joinUrl });

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
      graph.addCalendarEvent({ joinUrl: ROADMAP_JOIN_URL });

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
      graph.addCalendarEvent({ joinUrl: planningJoinUrl });

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

    it('omits the subject and creation time Graph does not provide', async () => {
      graph.addMeeting({
        id: 'meeting-bare',
        joinWebUrl: ROADMAP_JOIN_URL,
        transcripts: [{ id: 'transcript-bare' }],
      });
      graph.addCalendarEvent({ joinUrl: ROADMAP_JOIN_URL });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          transcripts: [
            { transcriptId: 'transcript-bare', meetingId: 'meeting-bare' },
          ],
        }),
      );
    });

    it('skips meetings Graph no longer returns for the join URL', async () => {
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/expired',
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        window,
        requesterContext,
      );

      expect(result).toEqual(
        expect.objectContaining({ success: true, transcripts: [] }),
      );
    });
  });

  describe('choosing the connection', () => {
    it('uses the requester personal connection over another user connection', async () => {
      addRoadmapMeeting();
      appRuntime.setConnections([
        buildTeamsAppConnection('someone-elses-token', {
          id: 'connected-account-teams-2',
          userWorkspaceId: 'user-workspace-2',
        }),
        buildTeamsAppConnection(graph.accessToken),
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
        buildTeamsAppConnection(graph.accessToken, {
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
        buildTeamsAppConnection(graph.accessToken, {
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
        buildTeamsAppConnection(graph.accessToken, {
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
