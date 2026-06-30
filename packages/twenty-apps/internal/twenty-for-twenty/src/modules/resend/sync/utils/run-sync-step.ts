import type { StepOutcome } from '@modules/resend/sync/types/step-outcome';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import { getErrorMessage } from '@modules/resend/shared/utils/get-error-message';

export const runSyncStep = async <TValue>(
  name: string,
  executeStep: () => Promise<SyncStepResult<TValue>>,
): Promise<StepOutcome<TValue>> => {
  const startedAt = performance.now();

  try {
    const { result, value } = await executeStep();

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

export const skipDueToFailedDependencies = (
  name: string,
  prerequisiteOutcomes: Record<string, StepOutcome<unknown>>,
): StepOutcome<never> => {
  const failed = Object.entries(prerequisiteOutcomes)
    .filter(([, outcome]) => outcome.status !== 'ok')
    .map(([prerequisiteName]) => prerequisiteName);

  return {
    name,
    status: 'skipped',
    reason: `prerequisite step(s) did not complete successfully: ${failed.join(', ')}`,
  };
};
