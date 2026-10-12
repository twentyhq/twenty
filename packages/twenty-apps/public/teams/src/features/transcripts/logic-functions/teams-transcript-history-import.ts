import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-import-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { handleTeamsTranscriptHistoryRoute } from 'src/features/transcripts/logic-functions/utils/handle-teams-transcript-history-route';
import { startTeamsTranscriptHistoryImportFromCountOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-import-from-count-or-throw';

export const teamsTranscriptHistoryImportHandler = (
  routePayload: RoutePayload<{ runId?: unknown }>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsTranscriptHistoryRouteResult> =>
  handleTeamsTranscriptHistoryRoute({
    context,
    failureLogMessage: 'failed to start importing transcript history',
    handle: async (connectedAccountId) => {
      const runId = routePayload.body?.runId;

      if (!isNonEmptyString(runId)) {
        return { success: false, errorCode: 'count-required' };
      }

      return startTeamsTranscriptHistoryImportFromCountOrThrow({
        connectedAccountId,
        runId,
      });
    },
  });

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-import',
  description:
    'Starts importing the Teams transcripts counted for the connection the requesting user added, waiting a minute after each calendar page that imported transcripts.',
  timeoutSeconds: 30,
  handler: teamsTranscriptHistoryImportHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
