import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

export type StepFailure = { error: string };

const formatStepFailureMessage = (stepLabel: string, error: unknown): string =>
  `[call-recorder] ${stepLabel} failed: ${
    error instanceof Error ? error.message : String(error)
  }`;

export const buildStepFailure = (
  stepLabel: string,
  error: unknown,
): StepFailure => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(formatStepFailureMessage(stepLabel, error));
  }

  return { error: `${stepLabel} failed` };
};

// Only RetryableLogicFunctionError makes the job runner redeliver an enqueued job.
export const buildRetryableStepFailure = (
  stepLabel: string,
  error: unknown,
): RetryableLogicFunctionError =>
  new RetryableLogicFunctionError(formatStepFailureMessage(stepLabel, error));
