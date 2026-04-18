import type { StepOutcome } from 'src/modules/resend/sync/types/step-outcome';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import { getErrorMessage } from 'src/modules/resend/shared/utils/get-error-message';

export const runSyncStep = async <TValue>(
  name: string,
  fn: () => Promise<SyncStepResult<TValue>>,
): Promise<StepOutcome<TValue>> => {
  const startedAt = performance.now();

  try {
    const { result, value } = await fn();

    return {
      name,
      status: 'ok',
      durationMs: Math.round(performance.now() - startedAt),
      result,
      value,
    };
  } catch (error) {
    return {
      name,
      status: 'failed',
      durationMs: Math.round(performance.now() - startedAt),
      error: getErrorMessage(error),
    };
  }
};

export const skipDueToFailedDeps = (
  name: string,
  deps: Record<string, StepOutcome<unknown>>,
): StepOutcome<never> => {
  const failed = Object.entries(deps)
    .filter(([, outcome]) => outcome.status !== 'ok')
    .map(([depName]) => depName);

  return {
    name,
    status: 'skipped',
    reason: `prerequisite step(s) did not complete successfully: ${failed.join(', ')}`,
  };
};
