import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TeamsConnectionUnavailableError } from 'src/features/transcripts/logic-functions/types/teams-connection-unavailable-error';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const handleTeamsTranscriptHistoryRoute = async ({
  context,
  failureLogMessage,
  handle,
}: {
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>;
  failureLogMessage: string;
  handle: (
    connectedAccountId: string,
  ) => Promise<TeamsTranscriptHistoryRouteResult>;
}): Promise<TeamsTranscriptHistoryRouteResult> => {
  if (
    !RELEASE_FLAGS.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED ||
    !isFeatureEnabled({
      isAvailable: RELEASE_FLAGS.IS_TRANSCRIPT_IMPORT_RELEASED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return { success: false, errorCode: 'transcripts-not-enabled' };
  }

  try {
    // A history import pulls in every meeting of an account, so only the member who added the connection may run it.
    const connection = await getTeamsConnectionForRequestOrThrow(context, {
      isOwnConnectionRequired: true,
    });

    return await handle(connection.id);
  } catch (error) {
    if (error instanceof TeamsConnectionUnavailableError) {
      return { success: false, errorCode: error.code };
    }

    console.error(`[teams] ${failureLogMessage}: ${toErrorMessage(error)}`);

    return { success: false, errorCode: 'unknown' };
  }
};
