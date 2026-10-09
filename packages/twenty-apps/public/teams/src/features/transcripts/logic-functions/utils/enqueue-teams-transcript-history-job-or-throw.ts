import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';

import { TEAMS_IMPORT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT } from 'src/features/transcripts/logic-functions/constants/teams-transcript-import-job-retry-limit';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

export const enqueueTeamsTranscriptHistoryJobOrThrow = async ({
  job,
  delayMilliseconds,
}: {
  job: TeamsTranscriptHistoryJobPayload;
  delayMilliseconds: number;
}): Promise<void> => {
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        TEAMS_IMPORT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `teams-transcript-history-importing-${job.runId}-${job.chunkIndex}-${job.pageIndex}-${job.attempt}`,
          payload: job,
        },
      ],
      retryLimit: TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT,
      delayMs: delayMilliseconds,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Could not schedule Teams transcript history page ${job.pageIndex}: ${toErrorMessage(error)}`,
    );
  }
};
