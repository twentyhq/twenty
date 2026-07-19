import { type CoreApiClient } from 'twenty-client-sdk/core';

import { requestCallRecordingSummariesContinuation } from 'src/logic-functions/data/request-call-recording-summaries-continuation.util';
import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';
import { type GenerateCallRecordingSummaryResult } from 'src/logic-functions/flows/generate-call-recording-summary-result.type';
import { type GenerateMissingCallRecordingSummariesResult } from 'src/logic-functions/flows/generate-missing-call-recording-summaries-result.type';

type BatchSummaryOutcome =
  | GenerateCallRecordingSummaryResult['outcome']
  | 'generation-error';

export const generateMissingCallRecordingSummaries = async ({
  client,
  callRecordingIds,
  deadlineAtMs,
  getNowMs = () => Date.now(),
}: {
  client: CoreApiClient;
  callRecordingIds: string[];
  deadlineAtMs: number;
  getNowMs?: () => number;
}): Promise<GenerateMissingCallRecordingSummariesResult> => {
  const remainingCallRecordingIds = [...callRecordingIds];
  const generatedCallRecordingIds: string[] = [];
  const failedCallRecordingIds: string[] = [];
  const erroredCallRecordingIds: string[] = [];
  const skippedCallRecordingIds: string[] = [];
  let slowestItemMs = 0;

  // Always process at least one id so the remaining list strictly shrinks —
  // otherwise a single slow item would re-invoke with an unshrunk payload
  // forever.
  while (remainingCallRecordingIds.length > 0) {
    const callRecordingId = remainingCallRecordingIds[0];
    const itemStartedAtMs = getNowMs();

    let outcome: BatchSummaryOutcome;

    try {
      ({ outcome } = await generateCallRecordingSummary(client, {
        callRecordingId,
      }));
    } catch {
      outcome = 'generation-error';
    }

    remainingCallRecordingIds.shift();
    slowestItemMs = Math.max(slowestItemMs, getNowMs() - itemStartedAtMs);

    if (outcome === 'disabled') {
      // The workspace toggle turned off mid-run; stop spending immediately.
      return {
        generatedCallRecordingIds,
        failedCallRecordingIds,
        erroredCallRecordingIds,
        skippedCallRecordingIds,
        remainingCallRecordingIds,
        continuationRequested: false,
      };
    }

    if (outcome === 'generated') {
      generatedCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'empty-summary') {
      failedCallRecordingIds.push(callRecordingId);
    } else if (outcome === 'generation-error') {
      erroredCallRecordingIds.push(callRecordingId);
    } else {
      skippedCallRecordingIds.push(callRecordingId);
    }

    if (getNowMs() + slowestItemMs > deadlineAtMs) {
      break;
    }
  }

  const continuationRequested =
    remainingCallRecordingIds.length > 0
      ? await requestCallRecordingSummariesContinuation({
          callRecordingIds: remainingCallRecordingIds,
        })
      : false;

  return {
    generatedCallRecordingIds,
    failedCallRecordingIds,
    erroredCallRecordingIds,
    skippedCallRecordingIds,
    remainingCallRecordingIds,
    continuationRequested,
  };
};
