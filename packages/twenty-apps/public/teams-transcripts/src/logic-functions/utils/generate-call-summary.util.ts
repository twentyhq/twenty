import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  APP_DISPLAY_NAME,
  CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildCallSummaryPrompt } from 'src/logic-functions/utils/build-call-summary-prompt.util';
import { parseCallSummaryAgentResponse } from 'src/logic-functions/utils/parse-call-summary-agent-response.util';

export type GenerateCallSummaryOutcome =
  | 'not-found'
  | 'not-app-recording'
  | 'no-transcript'
  | 'already-summarized'
  | 'empty-summary'
  | 'not-summarizable'
  | 'generated';

type CallRecordingForSummary = {
  id: string;
  title?: string | null;
  transcript?: unknown;
  summary?: { markdown?: string | null } | null;
  createdBy?: { name?: string | null } | null;
};

const findCallRecordingForSummary = async (
  coreApiClient: Pick<CoreApiClient, 'query'>,
  callRecordingId: string,
): Promise<CallRecordingForSummary | undefined> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: { filter: { id: { eq: callRecordingId } }, first: 1 },
      edges: {
        node: {
          id: true,
          title: true,
          transcript: true,
          summary: { markdown: true },
          createdBy: { name: true },
        },
      },
    },
  });

  return queryResult.callRecordings?.edges?.[0]?.node ?? undefined;
};

// Other apps (Call Recorder, Fathom) own the summaries of the recordings they
// create, so only recordings this app wrote are summarized here.
export const generateCallSummary = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
}): Promise<{ outcome: GenerateCallSummaryOutcome }> => {
  const callRecording = await findCallRecordingForSummary(
    coreApiClient,
    callRecordingId,
  );

  if (!isDefined(callRecording)) {
    return { outcome: 'not-found' };
  }

  if (callRecording.createdBy?.name !== APP_DISPLAY_NAME) {
    return { outcome: 'not-app-recording' };
  }

  if (isNonEmptyString(callRecording.summary?.markdown)) {
    return { outcome: 'already-summarized' };
  }

  const prompt = buildCallSummaryPrompt({
    transcript: callRecording.transcript,
    title: callRecording.title ?? undefined,
  });

  if (!isDefined(prompt)) {
    return { outcome: 'no-transcript' };
  }

  const parsedResponse = parseCallSummaryAgentResponse(
    await runAgent({
      agentUniversalIdentifier: CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
      prompt,
    }),
  );

  if (!isDefined(parsedResponse)) {
    return { outcome: 'empty-summary' };
  }

  const summaryMarkdown =
    parsedResponse.outcome === 'not-summarizable'
      ? `## Summary unavailable\n\n${parsedResponse.reason}`
      : parsedResponse.markdown;

  await coreApiClient.mutation({
    updateCallRecording: {
      __args: {
        id: callRecordingId,
        data: { summary: { markdown: summaryMarkdown, blocknote: null } },
      },
      id: true,
    },
  });

  return {
    outcome:
      parsedResponse.outcome === 'not-summarizable'
        ? 'not-summarizable'
        : 'generated',
  };
};
