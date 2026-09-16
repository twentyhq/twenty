import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

const formatStepFailureMessage = (stepLabel: string, error: unknown): string =>
  `[companion] ${stepLabel} failed: ${
    error instanceof Error ? error.message : String(error)
  }`;

// Preserve explicit retry decisions; permanent errors must not become retryable.
export const buildStepError = (stepLabel: string, error: unknown): Error => {
  if (error instanceof RetryableLogicFunctionError) return error;
  return Object.assign(new Error(formatStepFailureMessage(stepLabel, error)), {
    cause: error,
  });
};
