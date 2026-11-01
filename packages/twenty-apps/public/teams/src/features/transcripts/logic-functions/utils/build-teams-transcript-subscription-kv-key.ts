import { TEAMS_TRANSCRIPT_SUBSCRIPTION_KV_KEY_PREFIX } from 'src/features/transcripts/logic-functions/constants/teams-transcript-subscription-kv-key-prefix';

export const buildTeamsTranscriptSubscriptionKvKey = (
  connectedAccountId: string,
): string =>
  `${TEAMS_TRANSCRIPT_SUBSCRIPTION_KV_KEY_PREFIX}:${connectedAccountId}`;
