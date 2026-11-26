import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type MeetCallSummaryOutcome } from 'src/logic-functions/types/meet-call-summary-outcome.type';
import { buildMeetCallSummaryPrompt } from 'src/logic-functions/utils/build-meet-call-summary-prompt.util';
import { findCallRecordingForSummary } from 'src/logic-functions/utils/find-call-recording-for-summary.util';
import { isMeetAiSummaryEnabledForMember } from 'src/logic-functions/utils/is-meet-ai-summary-enabled-for-member.util';
import { isTranscriptEntryList } from 'src/logic-functions/utils/is-transcript-entry-list.util';
import { parseMeetCallSummaryResponse } from 'src/logic-functions/utils/parse-meet-call-summary-response.util';
import { runMeetCallSummarizerOrThrow } from 'src/logic-functions/utils/run-meet-call-summarizer-or-throw.util';
import { saveCallRecordingSummaryIfEmpty } from 'src/logic-functions/utils/save-call-recording-summary-if-empty.util';

type MeetSummarizeCallRecordingResult =
  | { success: true; outcome: MeetCallSummaryOutcome }
  | { success: false; error: string };

export const meetSummarizeCallRecordingHandler = async ({
  callRecordingId,
  userWorkspaceId,
}: {
  callRecordingId?: string;
  userWorkspaceId?: string;
}): Promise<MeetSummarizeCallRecordingResult> => {
  if (
    !isNonEmptyString(callRecordingId) ||
    !isNonEmptyString(userWorkspaceId)
  ) {
    return { success: false, error: 'Invalid Google Meet call summary job' };
  }

  const { myUserApplicationVariables } = await new MetadataApiClient({
    runAs: 'application',
  }).query({
    myUserApplicationVariables: {
      userWorkspaceId: true,
      variables: { key: true, value: true },
    },
  });

  if (
    !isMeetAiSummaryEnabledForMember({
      memberApplicationVariables: myUserApplicationVariables,
      userWorkspaceId,
    })
  ) {
    return { success: true, outcome: 'DISABLED' };
  }

  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const callRecording = await findCallRecordingForSummary({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(callRecording)) {
    return { success: true, outcome: 'NOT_FOUND' };
  }

  if (isNonEmptyString(callRecording.summaryMarkdown)) {
    return { success: true, outcome: 'ALREADY_SUMMARIZED' };
  }

  if (!isTranscriptEntryList(callRecording.transcript)) {
    return { success: true, outcome: 'NO_TRANSCRIPT' };
  }

  const prompt = buildMeetCallSummaryPrompt({
    title: callRecording.title,
    transcriptEntries: callRecording.transcript,
  });

  if (!isNonEmptyString(prompt)) {
    return { success: true, outcome: 'NO_TRANSCRIPT' };
  }

  const summaryMarkdown = parseMeetCallSummaryResponse(
    await runMeetCallSummarizerOrThrow(prompt),
  );

  if (!isNonEmptyString(summaryMarkdown)) {
    return {
      success: false,
      error: 'The summarizer agent returned no summary',
    };
  }

  const isSaved = await saveCallRecordingSummaryIfEmpty({
    coreApiClient,
    callRecordingId,
    summaryMarkdown,
  });

  return {
    success: true,
    outcome: isSaved ? 'SUMMARIZED' : 'ALREADY_SUMMARIZED',
  };
};

export default defineLogicFunction({
  universalIdentifier:
    MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
  name: 'meet-summarize-call-recording',
  description:
    'Writes an AI summary of a Google Meet call that has a transcript but no Gemini notes.',
  timeoutSeconds: 240,
  handler: meetSummarizeCallRecordingHandler,
});
