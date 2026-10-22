import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPT_SUMMARY_TIMEOUT_SECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-summary-timeout-seconds';
import { type TeamsCallRecordingSummaryOutcome } from 'src/features/transcripts/logic-functions/types/teams-call-recording-summary-outcome.type';
import { summarizeTeamsCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/summarize-teams-call-recording-or-throw';

type TeamsSummarizeCallRecordingResult =
  | {
      success: true;
      callRecordingId: string;
      outcome: TeamsCallRecordingSummaryOutcome;
    }
  | { success: false; error: string };

export const teamsSummarizeCallRecordingHandler = async (payload: {
  callRecordingId?: unknown;
}): Promise<TeamsSummarizeCallRecordingResult> => {
  const { callRecordingId } = payload;

  if (!isNonEmptyString(callRecordingId)) {
    return { success: false, error: 'Invalid Teams transcript summary job' };
  }

  return {
    success: true,
    callRecordingId,
    outcome: await summarizeTeamsCallRecordingOrThrow({
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      callRecordingId,
    }),
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
  name: 'teams-summarize-call-recording',
  description:
    'Writes an AI summary on a Call Recording imported from Microsoft Teams.',
  timeoutSeconds: TEAMS_TRANSCRIPT_SUMMARY_TIMEOUT_SECONDS,
  handler: teamsSummarizeCallRecordingHandler,
});
