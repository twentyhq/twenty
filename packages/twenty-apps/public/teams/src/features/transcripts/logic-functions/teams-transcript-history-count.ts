import { isPositiveInteger } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-count-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-max-days';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_TRANSCRIPT_HISTORY_COUNT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TeamsConnectionUnavailableError } from 'src/features/transcripts/logic-functions/types/teams-connection-unavailable-error';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { startTeamsTranscriptHistoryCountOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-count-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const teamsTranscriptHistoryCountHandler = async (
  routePayload: RoutePayload<{ days?: unknown }>,
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

  const days = routePayload.body?.days;

  if (!isPositiveInteger(days) || days > TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS) {
    return { success: false, errorCode: 'invalid-days' };
  }

  try {
    const connection = await getTeamsConnectionForRequestOrThrow(context);

    return await startTeamsTranscriptHistoryCountOrThrow({
      connectedAccountId: connection.id,
      days,
    });
  } catch (error) {
    if (error instanceof TeamsConnectionUnavailableError) {
      return { success: false, errorCode: error.code };
    }

    console.error(
      `[teams] failed to start counting transcript history: ${toErrorMessage(error)}`,
    );

    return { success: false, errorCode: 'unknown' };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_COUNT_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-count',
  description:
    "Starts counting the Teams transcripts of the requesting user's connection over the last given number of days, before importing them.",
  timeoutSeconds: 30,
  handler: teamsTranscriptHistoryCountHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
