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

const WEEKLY_JOIN_URL = 'https://teams.microsoft.com/l/meetup-join/weekly';

describe('List My Teams Transcripts', () => {
  const { graph } = setupTeamsIntegrationTest();

  beforeEach(() => {
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
  });

  describe('matching occurrences', () => {
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
        ...buildHourLongOccurrence('2026-09-03T10:00:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...buildHourLongOccurrence('2026-09-10T10:00:00Z'),
      });

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        ...buildHourLongOccurrence('2026-09-03T10:00:00Z'),
      });
      graph.addCalendarEvent({
        joinUrl: WEEKLY_JOIN_URL,
        ...buildHourLongOccurrence('2026-09-10T10:00:00Z'),
      });

      const firstPage = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_REQUESTER_CONTEXT,
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
  });
});
