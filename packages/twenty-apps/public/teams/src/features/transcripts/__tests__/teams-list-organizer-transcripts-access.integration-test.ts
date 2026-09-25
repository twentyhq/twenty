import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_TEST_MEETING_WINDOW } from 'src/features/transcripts/__tests__/constants/teams-test-meeting-window.constant';
import { TEAMS_TEST_REQUESTER_CONTEXT } from 'src/features/transcripts/__tests__/constants/teams-test-requester-context.constant';
import { addRoadmapMeeting } from 'src/features/transcripts/__tests__/utils/add-roadmap-meeting.util';
import { buildTeamsAppConnection } from 'src/features/transcripts/__tests__/utils/build-teams-app-connection.util';
import { setupTeamsIntegrationTest } from 'src/features/transcripts/__tests__/utils/setup-teams-integration-test.util';
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

describe('List My Teams Transcripts', () => {
  const { graph, appRuntime } = setupTeamsIntegrationTest();

  beforeEach(() => {
    featureFlags.IS_TRANSCRIPT_IMPORT_ENABLED = true;
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
  });

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
          TEAMS_TEST_MEETING_WINDOW,
          TEAMS_TEST_REQUESTER_CONTEXT,
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

  describe('choosing the connection', () => {
    it('uses the requester personal connection over another user connection', async () => {
      addRoadmapMeeting(graph);
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: 'someone-elses-token',
          id: 'connected-account-teams-2',
          userWorkspaceId: 'user-workspace-2',
        }),
        buildTeamsAppConnection({ accessToken: graph.accessToken }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
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
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('add a connection first'),
      });
      expect(graph.calls).toHaveLength(0);
    });

    it('falls back to a workspace-shared connection when nobody triggered the run', async () => {
      addRoadmapMeeting(graph);
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: graph.accessToken,
          visibility: 'workspace',
          userWorkspaceId: 'user-workspace-2',
        }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        { userWorkspaceId: null },
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

    it('asks to reconnect when Microsoft authorization has failed', async () => {
      appRuntime.setConnections([
        buildTeamsAppConnection({
          accessToken: graph.accessToken,
          authFailedAt: '2026-09-19T00:00:00Z',
          authFailedReason: 'invalid_grant',
        }),
      ]);

      const result = await teamsListOrganizerTranscriptsHandler(
        TEAMS_TEST_MEETING_WINDOW,
        TEAMS_TEST_REQUESTER_CONTEXT,
      );

      expect(result).toEqual({
        success: false,
        error: 'Reconnect Microsoft Teams in the app settings',
      });
      expect(graph.calls).toHaveLength(0);
    });
  });
});
