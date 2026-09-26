import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_TEST_MEETING_WINDOW } from 'src/features/transcripts/__tests__/constants/teams-test-meeting-window.constant';
import { TEAMS_TEST_REQUESTER_CONTEXT } from 'src/features/transcripts/__tests__/constants/teams-test-requester-context.constant';
import { addRoadmapMeeting } from 'src/features/transcripts/__tests__/utils/add-roadmap-meeting.util';
import { buildHourLongOccurrence } from 'src/features/transcripts/__tests__/utils/build-hour-long-occurrence.util';
import { setupTeamsIntegrationTest } from 'src/features/transcripts/__tests__/utils/setup-teams-integration-test.util';
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

  describe('talking to Microsoft Graph', () => {
    it.each([
      { startDateTime: 'not-a-date' },
      {
        startDateTime: TEAMS_TEST_MEETING_WINDOW.endDateTime,
        endDateTime: TEAMS_TEST_MEETING_WINDOW.startDateTime,
      },
      { endDateTime: '2020-01-01T00:00:00Z' },
    ])('rejects the window %o before calling Graph', async (parameters) => {
      const result = await teamsListOrganizerTranscriptsHandler(
        parameters,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_REQUESTER_CONTEXT,
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

    it('skips meetings Graph no longer returns for the join URL', async () => {
      graph.addCalendarEvent({
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/expired',
        ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        ...buildHourLongOccurrence('2026-09-05T09:30:00Z'),
      });
      addRoadmapMeeting(graph);

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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

    it('retries a throttled request after the Retry-After delay', async () => {
      addRoadmapMeeting(graph);
      graph.failNextCall({ status: 429, headers: { 'Retry-After': '1' } });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
