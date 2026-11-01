import { TEAMS_TRANSCRIPTS_CONNECTION_KV_KEY_PREFIX } from 'src/features/transcripts/logic-functions/constants/teams-transcripts-connection-kv-key-prefix';

export const buildTeamsTranscriptsConnectionKvKey = (
  connectedAccountId: string,
): string =>
  `${TEAMS_TRANSCRIPTS_CONNECTION_KV_KEY_PREFIX}:${connectedAccountId}`;
