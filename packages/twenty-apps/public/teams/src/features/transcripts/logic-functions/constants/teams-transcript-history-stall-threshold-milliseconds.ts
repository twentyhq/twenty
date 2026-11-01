import { TEAMS_IMPORT_TRANSCRIPT_HISTORY_TIMEOUT_SECONDS } from 'src/features/transcripts/logic-functions/constants/teams-import-transcript-history-timeout-seconds';
import { TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-retry-delays-milliseconds';
import { TEAMS_TRANSCRIPT_HISTORY_STALL_MARGIN_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-stall-margin-milliseconds';

export const TEAMS_TRANSCRIPT_HISTORY_STALL_THRESHOLD_MILLISECONDS =
  Math.max(...TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS) +
  TEAMS_IMPORT_TRANSCRIPT_HISTORY_TIMEOUT_SECONDS * 1_000 +
  TEAMS_TRANSCRIPT_HISTORY_STALL_MARGIN_MILLISECONDS;
