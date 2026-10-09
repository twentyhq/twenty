import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';

import {
  TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
  TEAMS_IMPORT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
} from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT } from 'src/features/transcripts/logic-functions/constants/teams-transcript-import-job-retry-limit';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

export const enqueueTeamsTranscriptHistoryJobOrThrow = async ({
  phase,
  job,
  delayMilliseconds,
}: {
  phase: TeamsTranscriptHistoryRunningPhase;
  job: TeamsTranscriptHistoryJobPayload;
  delayMilliseconds: number;
}): Promise<void> => {
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        phase === 'counting'
          ? TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER
          : TEAMS_IMPORT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `teams-transcript-history-${phase}-${job.runId}-${job.chunkIndex}-${job.pageIndex}-${job.attempt}`,
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
