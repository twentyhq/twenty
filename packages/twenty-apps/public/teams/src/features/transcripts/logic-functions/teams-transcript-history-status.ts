import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-status-route-path';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_TRANSCRIPT_HISTORY_STATUS_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TeamsConnectionUnavailableError } from 'src/features/transcripts/logic-functions/types/teams-connection-unavailable-error';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const teamsTranscriptHistoryStatusHandler = async (
  _routePayload: RoutePayload,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<TeamsTranscriptHistoryRouteResult> => {
  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return { success: false, errorCode: 'transcripts-not-enabled' };
  }

  try {
    const connection = await getTeamsConnectionForRequestOrThrow(context);
    const state = await kv.get<TeamsTranscriptHistoryState>(
      buildTeamsTranscriptHistoryKvKey(connection.id),
    );

    return {
      success: true,
      state,
      isStalled:
        isDefined(state) &&
        isTeamsTranscriptHistoryStalled({ state, now: Date.now() }),
    };
  } catch (error) {
    if (error instanceof TeamsConnectionUnavailableError) {
      return { success: false, errorCode: error.code };
    }

    console.error(
      `[teams] failed to read transcript history status: ${toErrorMessage(error)}`,
    );

    return { success: false, errorCode: 'unknown' };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-status',
  description:
    "Returns the progress of the Teams transcript history count or import of the requesting user's connection.",
  timeoutSeconds: 15,
  handler: teamsTranscriptHistoryStatusHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
