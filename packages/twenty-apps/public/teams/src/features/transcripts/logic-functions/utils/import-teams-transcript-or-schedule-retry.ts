import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  AppConnectionAuthFailedError,
  enqueueJobs,
  getConnection,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT } from 'src/features/transcripts/logic-functions/constants/teams-transcript-import-job-retry-limit';
import { TEAMS_TRANSCRIPT_IMPORT_RETRY_DELAYS_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-import-retry-delays-milliseconds';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptImportOutcome } from 'src/features/transcripts/logic-functions/types/teams-transcript-import-outcome.type';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { syncTeamsTranscriptToCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/sync-teams-transcript-to-call-recording-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

type TeamsTranscriptSyncAttempt =
  | { outcome: 'imported' | 'skipped-deleted' | 'failed' }
  | { outcome: 'retry-needed'; retryReason: string };

const isPermanentTeamsTranscriptImportError = (error: unknown): boolean =>
  error instanceof AppConnectionAuthFailedError ||
  (error instanceof GraphRequestError &&
    (error.status === 401 || error.status === 403));

const attemptTeamsTranscriptSync = async ({
  connectedAccountId,
  meetingId,
  transcriptId,
}: {
  connectedAccountId: string;
  meetingId: string;
  transcriptId: string;
}): Promise<TeamsTranscriptSyncAttempt> => {
  try {
    const { accessToken } = await getConnection(connectedAccountId);
    const syncResult = await syncTeamsTranscriptToCallRecordingOrThrow({
      accessToken,
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      meetingId,
      transcriptId,
    });

    if (syncResult.skipped) {
      return { outcome: 'skipped-deleted' };
    }

    return syncResult.status === 'COMPLETED'
      ? { outcome: 'imported' }
      : {
          outcome: 'retry-needed',
          retryReason: 'Microsoft is still processing the transcript',
        };
  } catch (error) {
    if (error instanceof GraphRequestError && error.status === 404) {
      return {
        outcome: 'retry-needed',
        retryReason: 'Microsoft Graph did not find the transcript',
      };
    }

    console.error(
      `[teams] failed to import transcript ${transcriptId} for connected account ${connectedAccountId}: ${toErrorMessage(error)}`,
    );

    return isPermanentTeamsTranscriptImportError(error)
      ? { outcome: 'failed' }
      : { outcome: 'retry-needed', retryReason: toErrorMessage(error) };
  }
};

export const importTeamsTranscriptOrScheduleRetry = async ({
  connectedAccountId,
  meetingId,
  transcriptId,
  attempt,
}: {
  connectedAccountId: string;
  meetingId: string;
  transcriptId: string;
  attempt: number;
}): Promise<{ outcome: TeamsTranscriptImportOutcome }> => {
  const syncAttempt = await attemptTeamsTranscriptSync({
    connectedAccountId,
    meetingId,
    transcriptId,
  });

  if (syncAttempt.outcome !== 'retry-needed') {
    return { outcome: syncAttempt.outcome };
  }

  const retryDelayMilliseconds =
    TEAMS_TRANSCRIPT_IMPORT_RETRY_DELAYS_MILLISECONDS[attempt];

  if (!isDefined(retryDelayMilliseconds)) {
    console.error(
      `[teams] gave up importing transcript ${transcriptId} for connected account ${connectedAccountId}: ${syncAttempt.retryReason}. The Sync Teams Transcript action can import it.`,
    );

    return { outcome: 'retries-exhausted' };
  }

  const nextAttempt = attempt + 1;

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          // Graph transcript ids hold characters that job ids reject.
          jobId: `teams-transcript-import-${computeCallRecordingIdForTeamsTranscript(transcriptId)}-${nextAttempt}`,
          payload: {
            connectedAccountId,
            meetingId,
            transcriptId,
            attempt: nextAttempt,
          },
        },
      ],
      retryLimit: TEAMS_TRANSCRIPT_IMPORT_JOB_RETRY_LIMIT,
      delayMs: retryDelayMilliseconds,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Could not schedule the next import of Teams transcript ${transcriptId}: ${toErrorMessage(error)}`,
    );
  }

  return { outcome: 'retry-scheduled' };
};
