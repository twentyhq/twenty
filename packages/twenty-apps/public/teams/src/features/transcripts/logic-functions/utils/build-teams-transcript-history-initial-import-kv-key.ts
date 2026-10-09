import { TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_KV_KEY_PREFIX } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-initial-import-kv-key-prefix';

export const buildTeamsTranscriptHistoryInitialImportKvKey = (
  connectedAccountId: string,
): string =>
  `${TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_KV_KEY_PREFIX}:${connectedAccountId}`;
