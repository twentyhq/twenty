import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingIdsMissingSummary } from 'src/logic-functions/data/find-call-recording-ids-missing-summary.util';
import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';
import { type HealCallRecordingsMissingSummaryResult } from 'src/logic-functions/flows/heal-call-recordings-missing-summary-result.type';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

const MAX_AGENT_RUNS_PER_TICK = 2;
const MAX_CANDIDATES_PER_TICK = 10;
const RECENT_UPDATE_GRACE_MINUTES = 30;

export const healCallRecordingsMissingSummary = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<HealCallRecordingsMissingSummaryResult> => {
  const summarizedCallRecordingIds: string[] = [];
  const failedSummaryCallRecordingIds: string[] = [];

  if (!isCallRecordingSummaryEnabled()) {
    return { summarizedCallRecordingIds, failedSummaryCallRecordingIds };
  }

  const candidateCallRecordingIds = (
    await findCallRecordingIdsMissingSummary(client, {
      updatedBefore: new Date(
        now.getTime() - RECENT_UPDATE_GRACE_MINUTES * 60 * 1000,
      ).toISOString(),
    })
  ).slice(0, MAX_CANDIDATES_PER_TICK);

  for (const callRecordingId of candidateCallRecordingIds) {
    const agentRunCount =
      summarizedCallRecordingIds.length + failedSummaryCallRecordingIds.length;

    if (agentRunCount >= MAX_AGENT_RUNS_PER_TICK) {
      break;
    }

    const { outcome } = await generateCallRecordingSummary(client, {
      callRecordingId,
    });

    if (outcome === 'generated') {
      summarizedCallRecordingIds.push(callRecordingId);
    }

    if (outcome === 'empty-summary') {
      failedSummaryCallRecordingIds.push(callRecordingId);
    }
  }

  return { summarizedCallRecordingIds, failedSummaryCallRecordingIds };
};
