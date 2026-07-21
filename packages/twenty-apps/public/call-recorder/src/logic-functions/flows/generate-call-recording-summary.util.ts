import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summarizer-agent-universal-identifier';
import { findCallRecordingForSummary } from 'src/logic-functions/data/find-call-recording-for-summary.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/build-call-recording-summary-prompt.util';
import { extractCallRecordingSummaryMarkdown } from 'src/logic-functions/domain/extract-call-recording-summary-markdown.util';
import { isCallRecordingCreatedByCallRecorder } from 'src/logic-functions/domain/is-call-recording-created-by-call-recorder.util';
import { isRealTranscript } from 'src/logic-functions/domain/is-real-transcript.util';
import { type GenerateCallRecordingSummaryResult } from 'src/logic-functions/flows/generate-call-recording-summary-result.type';
import { getCallRecorderAdditionalSummaryPrompt } from 'src/logic-functions/utils/get-call-recorder-additional-summary-prompt.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

export const generateCallRecordingSummary = async (
  client: CoreApiClient,
  {
    callRecordingId,
    requireCreatedByCallRecorder = false,
  }: { callRecordingId: string; requireCreatedByCallRecorder?: boolean },
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

  if (
    requireCreatedByCallRecorder &&
    !isCallRecordingCreatedByCallRecorder(callRecording.createdBy)
  ) {
    return { outcome: 'not-app-recording' };
  }

  if (callRecording.summaryMarkdown !== undefined) {
    return { outcome: 'already-summarized' };
  }

  const prompt = buildCallRecordingSummaryPrompt({
    transcript: callRecording.transcript,
    title: callRecording.title,
    additionalSummaryPrompt: getCallRecorderAdditionalSummaryPrompt(),
  });

  if (prompt === undefined) {
    return { outcome: 'no-transcript' };
  }

  const agentResult = await runAgent({
    agentUniversalIdentifier:
      CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
    prompt,
  });

  const markdown = extractCallRecordingSummaryMarkdown(agentResult);

  if (markdown === undefined) {
    return { outcome: 'empty-summary' };
  }

  await updateCallRecording(client, {
    id: callRecordingId,
    data: { summary: { blocknote: null, markdown } },
  });

  return { outcome: 'generated' };
};
