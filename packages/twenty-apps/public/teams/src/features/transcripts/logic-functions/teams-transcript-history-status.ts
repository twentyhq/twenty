import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-status-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_STATUS_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { handleTeamsTranscriptHistoryRoute } from 'src/features/transcripts/logic-functions/utils/handle-teams-transcript-history-route';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';

export const teamsTranscriptHistoryStatusHandler = (
  _routePayload: RoutePayload,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsTranscriptHistoryRouteResult> =>
  handleTeamsTranscriptHistoryRoute({
    context,
    failureLogMessage: 'failed to read transcript history status',
    handle: async (connectedAccountId) => {
      const state = await kv.get<TeamsTranscriptHistoryState>(
        buildTeamsTranscriptHistoryKvKey(connectedAccountId),
      );

      if (!isDefined(state)) {
        return { success: true, state: null, isStalled: false };
      }

      const { nextJob: _nextJob, ...routeState } = state;

      return {
        success: true,
        state: routeState,
        isStalled: isTeamsTranscriptHistoryStalled({ state, now: Date.now() }),
      };
    },
  });

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-status',
  description:
    'Returns the progress of the Teams transcript history count or import of the connection the requesting user added.',
  timeoutSeconds: 15,
  handler: teamsTranscriptHistoryStatusHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
