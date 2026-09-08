import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

export type StepFailure = { error: string };

const formatStepFailureMessage = (stepLabel: string, error: unknown): string =>
  `[companion] ${stepLabel} failed: ${
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

// Preserve explicit retry decisions; permanent errors must not become retryable.
export const buildStepError = (stepLabel: string, error: unknown): Error => {
  if (error instanceof RetryableLogicFunctionError) return error;
  return Object.assign(new Error(formatStepFailureMessage(stepLabel, error)), {
    cause: error,
  });
};
