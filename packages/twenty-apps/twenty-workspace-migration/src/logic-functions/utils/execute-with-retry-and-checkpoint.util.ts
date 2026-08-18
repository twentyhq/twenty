import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { saveMigrationStateCheckpoint } from "src/logic-functions/utils/migration-state.util";

const CHECKPOINT_EVERY_N_REQUESTS = 49;
let requestsSinceCheckpoint = 0;

// Drop-in replacement for executeWithRetry: also counts requests and, every
// CHECKPOINT_EVERY_N_REQUESTS, spends the next one on persisting a fresh checkpoint instead of
// migration work - so the 50th request in the sequence is a checkpoint save. This bounds how
// much progress-tracking granularity could be lost if the run is cut off by the platform's
// timeoutSeconds limit before the next stage boundary, since a stage like record migration can
// span thousands of individual requests.
export const executeWithRetryAndCheckpoint = async <T>(execute: () => T): Promise<Awaited<T>> => {
  const result = await executeWithRetry(execute);
  requestsSinceCheckpoint += 1;
  if (requestsSinceCheckpoint >= CHECKPOINT_EVERY_N_REQUESTS) {
    requestsSinceCheckpoint = 0;
    await saveMigrationStateCheckpoint();
  }
  return result;
};
