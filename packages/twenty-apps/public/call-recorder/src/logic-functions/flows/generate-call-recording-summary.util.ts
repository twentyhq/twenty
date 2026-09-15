import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findCallRecordingForSummary } from 'src/logic-functions/data/find-call-recording-for-summary.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/build-call-recording-summary-prompt.util';
import { isCallRecordingCreatedByCallRecorder } from 'src/logic-functions/domain/is-call-recording-created-by-call-recorder.util';
import { isRealTranscript } from 'src/logic-functions/domain/is-real-transcript.util';
import { parseCallRecordingSummaryAgentResponse } from 'src/logic-functions/domain/parse-call-recording-summary-agent-response.util';
import { type GenerateCallRecordingSummaryResult } from 'src/logic-functions/flows/generate-call-recording-summary-result.type';
import { buildStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getCallRecorderAdditionalSummaryPrompt } from 'src/logic-functions/utils/get-call-recorder-additional-summary-prompt.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

export const generateCallRecordingSummary = async (
  client: CoreApiClient,
  {
    callRecordingId,
    requireCreatedByCallRecorder = false,
    shouldRegenerateExistingSummary = false,
  }: {
    callRecordingId: string;
    requireCreatedByCallRecorder?: boolean;
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

  if (
    requireCreatedByCallRecorder &&
    !isCallRecordingCreatedByCallRecorder(callRecording.createdBy)
  ) {
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

  const parsedAgentResponse =
    parseCallRecordingSummaryAgentResponse(agentResult);

  if (parsedAgentResponse === undefined) {
    return { outcome: 'empty-summary' };
  }

  const summaryMarkdown =
    parsedAgentResponse.outcome === 'not-summarizable'
      ? `## Summary unavailable\n\n${parsedAgentResponse.reason}`
      : parsedAgentResponse.markdown;

  try {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { summary: { blocknote: null, markdown: summaryMarkdown } },
    });
  } catch (error) {
    // Not rethrown: a redelivery would re-bill the agent run that already succeeded.
    buildStepFailure('call recording summary save', error);

    return { outcome: 'save-error' };
  }

  return {
    outcome:
      parsedAgentResponse.outcome === 'not-summarizable'
        ? 'not-summarizable'
        : 'generated',
  };
};
