import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';

import { TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT } from 'src/features/transcripts/logic-functions/constants/teams-transcript-import-job-retry-limit';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

export const enqueueTeamsTranscriptImportRetryOrThrow = async ({
  connectedAccountId,
  meetingId,
  transcriptId,
  attempt,
  delayMilliseconds,
}: {
  connectedAccountId: string;
  meetingId: string;
  transcriptId: string;
  attempt: number;
  delayMilliseconds: number;
}): Promise<void> => {
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          // Graph transcript ids hold characters that job ids reject.
          jobId: `teams-transcript-import-${computeCallRecordingIdForTeamsTranscript(transcriptId)}-${attempt}`,
          payload: { connectedAccountId, meetingId, transcriptId, attempt },
        },
      ],
      retryLimit: TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT,
      delayMs: delayMilliseconds,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Could not schedule the next import of Teams transcript ${transcriptId}: ${toErrorMessage(error)}`,
    );
  }
};
