import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { runAgent } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GOOGLE_MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type GoogleMeetCallSummaryOutcome } from 'src/logic-functions/types/google-meet-call-summary-outcome.type';
import { buildGoogleMeetCallSummaryPrompt } from 'src/logic-functions/utils/build-google-meet-call-summary-prompt.util';
import { findCallRecordingForSummary } from 'src/logic-functions/utils/find-call-recording-for-summary.util';
import { isTranscriptEntryList } from 'src/logic-functions/utils/is-transcript-entry-list.util';
import { parseGoogleMeetCallSummaryResponse } from 'src/logic-functions/utils/parse-google-meet-call-summary-response.util';
import { saveCallRecordingSummaryOrThrow } from 'src/logic-functions/utils/save-call-recording-summary-or-throw.util';

type GoogleMeetSummarizeCallRecordingResult =
  | { success: true; outcome: GoogleMeetCallSummaryOutcome }
  | { success: false; error: string };

export const googleMeetSummarizeCallRecordingHandler = async ({
  callRecordingId,
}: {
  callRecordingId?: string;
}): Promise<GoogleMeetSummarizeCallRecordingResult> => {
  if (!isNonEmptyString(callRecordingId)) {
    return { success: false, error: 'Invalid Google Meet call summary job' };
  }

  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const callRecording = await findCallRecordingForSummary({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(callRecording)) {
    return { success: true, outcome: 'NOT_FOUND' };
  }

  if (isNonEmptyString(callRecording.summary?.markdown)) {
    return { success: true, outcome: 'ALREADY_SUMMARIZED' };
  }

  if (!isTranscriptEntryList(callRecording.transcript)) {
    return { success: true, outcome: 'NO_TRANSCRIPT' };
  }

  const prompt = buildGoogleMeetCallSummaryPrompt({
    title: callRecording.title ?? undefined,
    transcriptEntries: callRecording.transcript,
  });

  if (!isNonEmptyString(prompt)) {
    return { success: true, outcome: 'NO_TRANSCRIPT' };
  }

  const summaryMarkdown = parseGoogleMeetCallSummaryResponse(
    await runAgent({
      agentUniversalIdentifier:
        GOOGLE_MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
      input: prompt,
    }),
  );

  if (!isNonEmptyString(summaryMarkdown)) {
    return {
      success: false,
      error: 'The summarizer agent returned no summary',
    };
  }

  await saveCallRecordingSummaryOrThrow({
    coreApiClient,
    callRecordingId,
    summaryMarkdown,
  });

  return { success: true, outcome: 'SUMMARIZED' };
};

export default defineLogicFunction({
  universalIdentifier:
    GOOGLE_MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-summarize-call-recording',
  description:
    'Writes an AI summary of a Google Meet call that has a transcript but no Gemini notes.',
  timeoutSeconds: 240,
  handler: googleMeetSummarizeCallRecordingHandler,
});
