import type { StepOutcome } from 'src/modules/resend/sync/types/step-outcome';

export const MAX_ERRORS_IN_THROWN_MESSAGE = 20;

type AggregatedError = {
  step: string;
  message: string;
};

const collectErrors = (
  outcomes: ReadonlyArray<StepOutcome<unknown>>,
): AggregatedError[] => {
  const errors: AggregatedError[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === 'failed') {
      errors.push({ step: outcome.name, message: outcome.error });

      continue;
    }

    if (outcome.status === 'ok') {
      for (const error of outcome.result.errors) {
        errors.push({ step: outcome.name, message: error });
      }
    }
  }

  return errors;
};

export const reportAndThrowIfErrors = (
  outcomes: ReadonlyArray<StepOutcome<unknown>>,
): void => {
  const errors = collectErrors(outcomes);

  if (errors.length === 0) {
    return;
  }

  const head = errors
    .slice(0, MAX_ERRORS_IN_THROWN_MESSAGE)
    .map(({ step, message }) => `  - [${step}] ${message}`)
    .join('\n');

  const remaining = errors.length - MAX_ERRORS_IN_THROWN_MESSAGE;
  const suffix = remaining > 0 ? `\n  ...and ${remaining} more` : '';

  throw new Error(
    `Sync completed with ${errors.length} error(s):\n${head}${suffix}`,
  );
};
