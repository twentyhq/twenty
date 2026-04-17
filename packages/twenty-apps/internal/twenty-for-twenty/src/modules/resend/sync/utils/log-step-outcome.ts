import type { StepOutcome } from 'src/modules/resend/sync/types/step-outcome';

export const logStepOutcome = (outcome: StepOutcome<unknown>): void => {
  if (outcome.status === 'ok') {
    const { name, durationMs, result } = outcome;

    console.log(
      `[sync] ${name}: ok in ${durationMs}ms — fetched=${result.fetched} created=${result.created} updated=${result.updated} errors=${result.errors.length}`,
    );

    for (const error of result.errors) {
      console.error(`[sync] ${name} error: ${error}`);
    }

    return;
  }

  if (outcome.status === 'failed') {
    console.error(
      `[sync] ${outcome.name}: failed in ${outcome.durationMs}ms — ${outcome.error}`,
    );

    return;
  }

  console.warn(`[sync] ${outcome.name}: skipped — ${outcome.reason}`);
};
