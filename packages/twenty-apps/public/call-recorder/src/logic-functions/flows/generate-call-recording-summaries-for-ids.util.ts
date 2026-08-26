import { type CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';
import { type GenerateCallRecordingSummaryResult } from 'src/logic-functions/flows/generate-call-recording-summary-result.type';
import { type GenerateCallRecordingSummariesForIdsResult } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids-result.type';

type SummaryOutcome =
  | GenerateCallRecordingSummaryResult['outcome']
  | 'generation-error';

export const generateCallRecordingSummariesForIds = async ({
  client,
  callRecordingIds,
}: {
  client: CoreApiClient;
  callRecordingIds: string[];
}): Promise<GenerateCallRecordingSummariesForIdsResult> => {
  const generatedCallRecordingIds: string[] = [];
  const failedCallRecordingIds: string[] = [];
  const erroredCallRecordingIds: string[] = [];
  const skippedCallRecordingIds: string[] = [];
  const unavailableCallRecordingIds: string[] = [];

  for (const callRecordingId of callRecordingIds) {
    let outcome: SummaryOutcome;

    try {
      ({ outcome } = await generateCallRecordingSummary(client, {
        callRecordingId,
        shouldRegenerateExistingSummary: true,
      }));
    } catch {
      outcome = 'generation-error';
    }

    if (outcome === 'disabled') {
      // The workspace toggle turned off mid-run; stop spending immediately.
      break;
    }

    if (outcome === 'generated') {
      generatedCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'not-summarizable') {
      unavailableCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'empty-summary') {
      failedCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'generation-error' || outcome === 'save-error') {
      erroredCallRecordingIds.push(callRecordingId);
    } else {
      skippedCallRecordingIds.push(callRecordingId);
    }
  }

  return {
    generatedCallRecordingIds,
    failedCallRecordingIds,
    erroredCallRecordingIds,
    skippedCallRecordingIds,
    unavailableCallRecordingIds,
  };
};
