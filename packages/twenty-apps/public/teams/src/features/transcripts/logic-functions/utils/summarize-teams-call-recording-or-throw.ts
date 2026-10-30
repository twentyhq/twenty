import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runAgent, type RunAgentResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsCallRecordingSummaryOutcome } from 'src/features/transcripts/logic-functions/types/teams-call-recording-summary-outcome.type';
import { buildTeamsTranscriptSummaryPrompt } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-summary-prompt';
import { findCallRecordingForSummaryOrThrow } from 'src/features/transcripts/logic-functions/utils/find-call-recording-for-summary-or-throw';
import { isTeamsTranscriptSummaryEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-summary-enabled';
import { parseTeamsTranscriptSummaryAgentResponse } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-summary-agent-response';
import { toErrorMessage } from 'src/utils/to-error-message';

export const summarizeTeamsCallRecordingOrThrow = async ({
  coreApiClient,
  callRecordingId,
  shouldRegenerateExistingSummary = false,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  shouldRegenerateExistingSummary?: boolean;
}): Promise<TeamsCallRecordingSummaryOutcome> => {
  if (!isTeamsTranscriptSummaryEnabled()) {
    return 'disabled';
  }

  const callRecording = await findCallRecordingForSummaryOrThrow({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(callRecording)) {
    return 'not-found';
  }

  if (callRecording.hasSummary && !shouldRegenerateExistingSummary) {
    return 'already-summarized';
  }

  const prompt = buildTeamsTranscriptSummaryPrompt({
    transcript: callRecording.transcript,
    title: callRecording.title,
  });

  if (!isDefined(prompt)) {
    return 'no-transcript';
  }

  const agentResult: Pick<RunAgentResult, 'success' | 'error' | 'result'> =
    await runAgent({
      agentUniversalIdentifier:
        TEAMS_TRANSCRIPT_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
      prompt,
    }).catch((error: unknown) => ({
      success: false,
      error: toErrorMessage(error),
      result: null,
    }));
  const summary = parseTeamsTranscriptSummaryAgentResponse(agentResult);

  if (!isDefined(summary)) {
    console.error(
      `[teams] summarizer agent returned no summary for call recording ${callRecordingId}: ${agentResult.error ?? 'empty response'}`,
    );

    return 'agent-failed';
  }

  const summaryMarkdown =
    summary.outcome === 'summarized'
      ? summary.markdown
      : `## Summary unavailable\n\n${summary.reason}`;

  try {
    await coreApiClient.mutation({
      updateCallRecording: {
        __args: {
          id: callRecordingId,
          data: { summary: { blocknote: null, markdown: summaryMarkdown } },
        },
        id: true,
      },
    });
  } catch (error) {
    console.error(
      `[teams] failed to save the summary of call recording ${callRecordingId}: ${toErrorMessage(error)}`,
    );

    return 'save-failed';
  }

  return summary.outcome;
};
