import { isNonEmptyString, isString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_SUMMARY_UNAVAILABLE_PREFIX } from 'src/features/transcripts/constants/teams-transcript-summary-unavailable-prefix';
import { type TeamsTranscriptSummary } from 'src/features/transcripts/logic-functions/types/teams-transcript-summary.type';

export const parseTeamsTranscriptSummaryAgentResponse = (
  agentResult: Pick<RunAgentResult, 'success' | 'error' | 'result'>,
): TeamsTranscriptSummary | undefined => {
  if (!agentResult.success || !isDefined(agentResult.result)) {
    return undefined;
  }

  const response =
    'response' in agentResult.result ? agentResult.result.response : undefined;
  const trimmedResponse = isString(response) ? response.trim() : '';

  if (!isNonEmptyString(trimmedResponse)) {
    return undefined;
  }

  if (
    !trimmedResponse.startsWith(TEAMS_TRANSCRIPT_SUMMARY_UNAVAILABLE_PREFIX)
  ) {
    return { outcome: 'summarized', markdown: trimmedResponse };
  }

  const reason = trimmedResponse
    .slice(TEAMS_TRANSCRIPT_SUMMARY_UNAVAILABLE_PREFIX.length)
    .trim();

  return isNonEmptyString(reason)
    ? { outcome: 'not-summarizable', reason }
    : undefined;
};
