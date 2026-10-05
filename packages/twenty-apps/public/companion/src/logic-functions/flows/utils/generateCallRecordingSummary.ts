import { type CoreApiClient } from 'twenty-client-sdk/core';
import { createHash } from 'crypto';
import { findCallRecordingForSummary } from 'src/logic-functions/data/utils/findCallRecordingForSummary';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';
import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/utils/buildCallRecordingSummaryPrompt';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';
import { isRealTranscript } from 'src/logic-functions/domain/utils/isRealTranscript';
import { getOrGenerateSummary } from 'src/logic-functions/flows/utils/getOrGenerateSummary';
import { type GenerateCallRecordingSummaryResult } from 'src/logic-functions/types/GenerateCallRecordingSummaryResult';
import { getCompanionAdditionalSummaryPrompt } from 'src/logic-functions/utils/getCompanionAdditionalSummaryPrompt';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/isCallRecordingSummaryEnabled';

export const generateCallRecordingSummary = async (
  client: CoreApiClient,
  {
    callRecordingId,
    shouldRegenerateExistingSummary = false,
  }: {
    callRecordingId: string;
    shouldRegenerateExistingSummary?: boolean;
  },
): Promise<GenerateCallRecordingSummaryResult> => {
  if (!isCallRecordingSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const callRecording = await findCallRecordingForSummary(client, {
    id: callRecordingId,
  });

  if (
    callRecording === undefined ||
    !isRealTranscript(callRecording.transcript)
  ) {
    return { outcome: 'no-transcript' };
  }

  if (!isDesktopAudioRecording(callRecording.companionSession)) {
    return { outcome: 'not-app-recording' };
  }

  if (
    !shouldRegenerateExistingSummary &&
    callRecording.summaryMarkdown !== undefined
  ) {
    return { outcome: 'already-summarized' };
  }

  const prompt = buildCallRecordingSummaryPrompt({
    transcript: callRecording.transcript,
    title: callRecording.title,
    additionalSummaryPrompt: getCompanionAdditionalSummaryPrompt(),
  });

  if (prompt === undefined) {
    return { outcome: 'no-transcript' };
  }

  const generation = shouldRegenerateExistingSummary
    ? createHash('sha256')
        .update(JSON.stringify([prompt, callRecording.summaryMarkdown ?? null]))
        .digest('hex')
    : 'automatic';
  const result = await getOrGenerateSummary(
    `companion-summary:${callRecordingId}:${generation}`,
    prompt,
  );
  if (result.status === 'INTERRUPTED') return { outcome: 'interrupted' };
  if (result.status === 'RUNNING') return { outcome: 'in-progress' };
  if (result.status === 'EMPTY') return { outcome: 'empty-summary' };

  const saved = await updateCallRecording(client, {
    id: callRecordingId,
    data: { summary: { blocknote: null, markdown: result.markdown } },
    expectedSummary: { markdown: callRecording.storedSummaryMarkdown },
  });
  return { outcome: saved ? result.outcome : 'already-summarized' };
};
