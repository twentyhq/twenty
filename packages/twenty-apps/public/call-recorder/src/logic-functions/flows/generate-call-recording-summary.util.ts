import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summarizer-agent-universal-identifier';
import { claimCallRecordingSummary } from 'src/logic-functions/data/claim-call-recording-summary.util';
import { findCallRecordingForSummary } from 'src/logic-functions/data/find-call-recording-for-summary.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { buildCallRecordingSummaryPrompt } from 'src/logic-functions/domain/build-call-recording-summary-prompt.util';
import { extractCallRecordingSummaryMarkdown } from 'src/logic-functions/domain/extract-call-recording-summary-markdown.util';
import { isRealTranscript } from 'src/logic-functions/domain/is-real-transcript.util';
import { getCallRecorderSummaryPrompt } from 'src/logic-functions/utils/get-call-recorder-summary-prompt.util';

export type GenerateCallRecordingSummaryResult = {
  outcome:
    | 'disabled'
    | 'no-transcript'
    | 'already-summarized'
    | 'not-claimed'
    | 'empty-summary'
    | 'generated';
};

export const generateCallRecordingSummary = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<GenerateCallRecordingSummaryResult> => {
  const summaryPrompt = getCallRecorderSummaryPrompt();

  if (summaryPrompt === false) {
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

  if (callRecording.summaryMarkdown !== undefined) {
    return { outcome: 'already-summarized' };
  }

  const prompt = buildCallRecordingSummaryPrompt({
    transcript: callRecording.transcript,
    title: callRecording.title,
    summaryPrompt,
  });

  if (prompt === undefined) {
    return { outcome: 'no-transcript' };
  }

  const claimed = await claimCallRecordingSummary(client, {
    id: callRecordingId,
  });

  if (!claimed) {
    return { outcome: 'not-claimed' };
  }

  let agentResult: Awaited<ReturnType<typeof runAgent>>;

  try {
    agentResult = await runAgent({
      agentUniversalIdentifier:
        CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
      prompt,
    });
  } catch (error) {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { summary: null },
    });

    throw error;
  }

  const markdown = extractCallRecordingSummaryMarkdown(agentResult);

  if (markdown === undefined) {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { summary: null },
    });

    return { outcome: 'empty-summary' };
  }

  try {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { summary: { markdown } },
    });

    return { outcome: 'generated' };
  } catch (error) {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: { summary: null },
    });

    throw error;
  }
};
