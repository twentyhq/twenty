import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';

// One page may legitimately run for a whole job timeout, plus time spent waiting in the queue
export const LINKEDIN_HISTORY_IMPORT_STALL_THRESHOLD_MILLISECONDS =
  LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS * 1_000 + 15 * 60 * 1_000;
