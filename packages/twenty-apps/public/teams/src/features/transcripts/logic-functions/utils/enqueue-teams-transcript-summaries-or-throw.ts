import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';

import { TEAMS_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_SUMMARY_JOB_RETRY_LIMIT } from 'src/features/transcripts/logic-functions/constants/teams-transcript-summary-job-retry-limit';
import { type TeamsCallRecordingSummaryEvent } from 'src/features/transcripts/logic-functions/types/teams-call-recording-summary-event.type';
import { isTeamsTranscriptSummaryEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-summary-enabled';
import { selectTeamsCallRecordingIdsToSummarize } from 'src/features/transcripts/logic-functions/utils/select-teams-call-recording-ids-to-summarize';
import { toErrorMessage } from 'src/utils/to-error-message';

export const enqueueTeamsTranscriptSummariesOrThrow = async (
  events: TeamsCallRecordingSummaryEvent[],
): Promise<void> => {
  if (!isTeamsTranscriptSummaryEnabled()) {
    return;
  }

  const callRecordingIds = selectTeamsCallRecordingIdsToSummarize({
    events,
    applicationId: process.env.APPLICATION_ID,
  });

  if (callRecordingIds.length === 0) {
    return;
  }

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        TEAMS_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
      jobs: callRecordingIds.map((callRecordingId) => ({
        jobId: `teams-transcript-summary-${callRecordingId}`,
        payload: { callRecordingId },
      })),
      retryLimit: TEAMS_TRANSCRIPT_SUMMARY_JOB_RETRY_LIMIT,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Could not schedule Teams transcript summaries: ${toErrorMessage(error)}`,
    );
  }
};
