import { GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE } from 'src/features/transcripts/logic-functions/constants/graph-access-to-transcripts-disabled-error-code';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';

export const isUnavailableTeamsTranscriptError = (error: unknown): boolean =>
  error instanceof GraphRequestError &&
  (error.status === 404 ||
    (error.status === 403 &&
      error.innerErrorCode !==
        GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE));
