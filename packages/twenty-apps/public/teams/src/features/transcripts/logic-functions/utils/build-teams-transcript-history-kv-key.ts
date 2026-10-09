import { TEAMS_TRANSCRIPT_HISTORY_KV_KEY_PREFIX } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-kv-key-prefix';

export const buildTeamsTranscriptHistoryKvKey = (
  connectedAccountId: string,
): string => `${TEAMS_TRANSCRIPT_HISTORY_KV_KEY_PREFIX}:${connectedAccountId}`;
