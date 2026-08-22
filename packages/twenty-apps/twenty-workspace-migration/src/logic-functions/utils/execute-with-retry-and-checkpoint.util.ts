import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { migrationState, saveMigrationStateCheckpoint } from "src/logic-functions/utils/migration-state.util";

let requestsSinceCheckpoint = 0;

export const executeWithRetryAndCheckpoint = async <T>(execute: () => T): Promise<Awaited<T>> => {
  const result = await executeWithRetry(execute);
  requestsSinceCheckpoint += 1;
  if (requestsSinceCheckpoint >= migrationState.maxRequests) {
    requestsSinceCheckpoint = 0;
    await saveMigrationStateCheckpoint();
  }
  return result;
};
