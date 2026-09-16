import { type StepFailure } from 'src/logic-functions/types/StepFailure';

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
