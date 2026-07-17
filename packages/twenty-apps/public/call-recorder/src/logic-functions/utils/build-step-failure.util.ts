export type StepFailure = { error: string };

export const buildStepFailure = (
  stepLabel: string,
  error: unknown,
): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[call-recorder] ${stepLabel} failed: ${errorMessage}`);
  }

  return { error: `${stepLabel} failed` };
};
