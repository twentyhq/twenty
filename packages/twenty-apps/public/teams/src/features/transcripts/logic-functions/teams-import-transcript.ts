import { isNonEmptyString, isPositiveInteger } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsTranscriptImportOutcome } from 'src/features/transcripts/logic-functions/types/teams-transcript-import-outcome.type';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';
import { buildTeamsTranscriptSubscriptionKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-subscription-kv-key';
import { importTeamsTranscriptOrScheduleRetry } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-or-schedule-retry';
import { isTeamsTranscriptImportEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-import-enabled';

type TeamsImportTranscriptResult =
  | { success: true; outcome: TeamsTranscriptImportOutcome }
  | { success: true; skipped: true; reason: string }
  | { success: false; error: string };

export const teamsImportTranscriptHandler = async (payload: {
  connectedAccountId?: unknown;
  meetingId?: unknown;
  transcriptId?: unknown;
  attempt?: unknown;
}): Promise<TeamsImportTranscriptResult> => {
  const { connectedAccountId, meetingId, transcriptId, attempt } = payload;

  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(meetingId) ||
    !isNonEmptyString(transcriptId) ||
    !isPositiveInteger(attempt)
  ) {
    return { success: false, error: 'Invalid Teams transcript import job' };
  }

  if (!isTeamsTranscriptImportEnabled()) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcripts are not enabled',
    };
  }

  const subscription = await kv.get<TeamsTranscriptSubscription>(
    buildTeamsTranscriptSubscriptionKvKey(connectedAccountId),
  );

  if (!isDefined(subscription)) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams connection no longer has a transcript subscription',
    };
  }

  const { outcome } = await importTeamsTranscriptOrScheduleRetry({
    connectedAccountId,
    meetingId,
    transcriptId,
    attempt,
  });

  return { success: true, outcome };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_IMPORT_TRANSCRIPT_UNIVERSAL_IDENTIFIER,
  name: 'teams-import-transcript',
  description:
    'Retries importing a Teams transcript that Microsoft had not published when its notification arrived.',
  timeoutSeconds: 300,
  handler: teamsImportTranscriptHandler,
});
