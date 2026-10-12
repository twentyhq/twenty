import { isPositiveInteger } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-count-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-max-days';
import { TEAMS_TRANSCRIPT_HISTORY_COUNT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { handleTeamsTranscriptHistoryRoute } from 'src/features/transcripts/logic-functions/utils/handle-teams-transcript-history-route';
import { startTeamsTranscriptHistoryCountOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-count-or-throw';

export const teamsTranscriptHistoryCountHandler = (
  routePayload: RoutePayload<{ days?: unknown }>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsTranscriptHistoryRouteResult> =>
  handleTeamsTranscriptHistoryRoute({
    context,
    failureLogMessage: 'failed to start counting transcript history',
    handle: async (connectedAccountId) => {
      const days = routePayload.body?.days;

      if (
        !isPositiveInteger(days) ||
        days > TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS
      ) {
        return { success: false, errorCode: 'invalid-days' };
      }

      return startTeamsTranscriptHistoryCountOrThrow({
        connectedAccountId,
        days,
      });
    },
  });

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_COUNT_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-count',
  description:
    'Starts counting the Teams transcripts of the connection the requesting user added, over the last given number of days, before importing them.',
  timeoutSeconds: 30,
  handler: teamsTranscriptHistoryCountHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
