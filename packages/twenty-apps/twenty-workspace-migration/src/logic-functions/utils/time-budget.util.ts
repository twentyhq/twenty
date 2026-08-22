import { saveMigrationStateCheckpointAndStop } from "src/logic-functions/utils/migration-state.util";
import { TIMEOUT_SECONDS } from "src/constants/timeout-seconds";

const TIME_BUDGET_SAFETY_MARGIN_MS = 60_000;
const MAX_RUNTIME_MS = TIMEOUT_SECONDS * 1000 - TIME_BUDGET_SAFETY_MARGIN_MS;

let startedAt: number | null = null;

export const startTimeBudget = (): void => {
  startedAt = Date.now();
};

export const stopIfTimeBudgetExceeded = async (): Promise<boolean> => {
  if (getRemainingTimeBudgetMs() > 0) {
    return false;
  }
  await saveMigrationStateCheckpointAndStop();
  return true;
};

export const getRemainingTimeBudgetMs = (): number =>
  startedAt === null ? Number.POSITIVE_INFINITY : MAX_RUNTIME_MS - (Date.now() - startedAt);
