import { saveMigrationStateCheckpoint } from "src/logic-functions/utils/migration-state.util";
import { TIMEOUT_SECONDS } from "src/constants/timeout-seconds";

const TIME_BUDGET_SAFETY_MARGIN_MS = 60_000;
const MAX_RUNTIME_MS = TIMEOUT_SECONDS * 1000 - TIME_BUDGET_SAFETY_MARGIN_MS;

let startedAt: number | null = null;

export const startTimeBudget = (): void => {
  startedAt = Date.now();
};

export const stopIfTimeBudgetExceeded = async (): Promise<boolean> => {
  if (startedAt === null || Date.now() - startedAt <= MAX_RUNTIME_MS) {
    return false;
  }
  await saveMigrationStateCheckpoint();
  return true;
};
