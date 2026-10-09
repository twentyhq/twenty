import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';

import { GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE } from 'src/features/transcripts/logic-functions/constants/graph-access-to-transcripts-disabled-error-code';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';

export const getTeamsTranscriptHistoryFatalErrorCode = (
  error: unknown,
): TeamsTranscriptHistoryErrorCode | undefined => {
  if (
    error instanceof AppConnectionAuthFailedError ||
    (error instanceof GraphRequestError && error.status === 401)
  ) {
    return 'reconnect-required';
  }

  if (
    error instanceof GraphRequestError &&
    error.status === 403 &&
    error.innerErrorCode === GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE
  ) {
    return 'transcripts-disabled-by-admin';
  }

  return undefined;
};
