import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsCallRecordingSummaryOutcome } from 'src/features/transcripts/logic-functions/types/teams-call-recording-summary-outcome.type';
import { type TeamsGenerateCallSummariesResult } from 'src/features/transcripts/logic-functions/types/teams-generate-call-summaries-result.type';
import { summarizeTeamsCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/summarize-teams-call-recording-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';

const regenerateTeamsCallSummary = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
}): Promise<TeamsCallRecordingSummaryOutcome | 'error'> => {
  try {
    return await summarizeTeamsCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      shouldRegenerateExistingSummary: true,
    });
  } catch (error) {
    console.error(
      `[teams] failed to regenerate the summary of call recording ${callRecordingId}: ${toErrorMessage(error)}`,
    );

    return 'error';
  }
};

export const regenerateTeamsCallSummaries = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingIds: string[];
}): Promise<
  Omit<
    Extract<TeamsGenerateCallSummariesResult, { outcome: 'processed' }>,
    'outcome'
  >
> => {
  const summarizedCallRecordingIds: string[] = [];
  const unavailableCallRecordingIds: string[] = [];
  const failedCallRecordingIds: string[] = [];
  const skippedCallRecordingIds: string[] = [];

  for (const callRecordingId of callRecordingIds) {
    const outcome = await regenerateTeamsCallSummary({
      coreApiClient,
      callRecordingId,
    });

    if (outcome === 'summarized') {
      summarizedCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'not-summarizable') {
      unavailableCallRecordingIds.push(callRecordingId);
    } else if (
      outcome === 'agent-failed' ||
      outcome === 'save-failed' ||
      outcome === 'error'
    ) {
      failedCallRecordingIds.push(callRecordingId);
    } else {
      skippedCallRecordingIds.push(callRecordingId);
    }
  }

  return {
    summarizedCallRecordingIds,
    unavailableCallRecordingIds,
    failedCallRecordingIds,
    skippedCallRecordingIds,
  };
};
