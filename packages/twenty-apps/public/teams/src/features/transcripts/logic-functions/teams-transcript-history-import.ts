import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-import-route-path';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TeamsConnectionUnavailableError } from 'src/features/transcripts/logic-functions/types/teams-connection-unavailable-error';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { startTeamsTranscriptHistoryImportFromCountOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-import-from-count-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const teamsTranscriptHistoryImportHandler = async (
  routePayload: RoutePayload<{ runId?: unknown }>,
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

  const runId = routePayload.body?.runId;

  if (!isNonEmptyString(runId)) {
    return { success: false, errorCode: 'count-required' };
  }

  try {
    const connection = await getTeamsConnectionForRequestOrThrow(context);

    return await startTeamsTranscriptHistoryImportFromCountOrThrow({
      connectedAccountId: connection.id,
      runId,
    });
  } catch (error) {
    if (error instanceof TeamsConnectionUnavailableError) {
      return { success: false, errorCode: error.code };
    }

    console.error(
      `[teams] failed to start importing transcript history: ${toErrorMessage(error)}`,
    );

    return { success: false, errorCode: 'unknown' };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TRANSCRIPT_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-history-import',
  description:
    "Starts importing the Teams transcripts counted for the requesting user's connection, one calendar page a minute.",
  timeoutSeconds: 30,
  handler: teamsTranscriptHistoryImportHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
