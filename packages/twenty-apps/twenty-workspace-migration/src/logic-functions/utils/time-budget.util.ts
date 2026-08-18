import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { TIMEOUT_SECONDS } from "src/constants/timeout-seconds";

// The platform kills the invocation once timeoutSeconds elapses, with no cleanup hook - if that
// happens mid-request, whatever the last checkpoint captured is all that's recoverable.
// TIME_BUDGET_SAFETY_MARGIN_MS leaves headroom to notice and stop at a clean stage/object
// boundary instead of racing the hard kill. TIMEOUT_SECONDS is also passed to
// defineLogicFunction in entry-point.ts so the two can't drift apart.
const TIME_BUDGET_SAFETY_MARGIN_MS = 60_000;
const MAX_RUNTIME_MS = TIMEOUT_SECONDS * 1000 - TIME_BUDGET_SAFETY_MARGIN_MS;

let startedAt: number | null = null;

// Called once, at the very top of handler(), before any stage runs.
export const startTimeBudget = (): void => {
  startedAt = Date.now();
};

// Checked between stages (and between objects within the record-migration stage) rather than
// continuously - stopping mid-request would leave a partially-applied write with no way to roll
// it back.
export const stopIfTimeBudgetExceeded = (): boolean => {
  if (startedAt === null || Date.now() - startedAt <= MAX_RUNTIME_MS) {
    return false;
  }
  console.warn(`Stopping before the platform's ${TIMEOUT_SECONDS}s timeout (after stage "${migrationState.stage}") - progress is checkpointed, but this run will not resume automatically.`);
  return true;
};
