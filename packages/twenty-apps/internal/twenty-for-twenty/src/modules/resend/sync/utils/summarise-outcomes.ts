import type { StepOutcome } from '@modules/resend/sync/types/step-outcome';

export type SyncSummaryStep = {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  fetched: number;
  created: number;
  updated: number;
  errorCount: number;
  durationMs: number;
};

export const summariseOutcomes = (
  outcomes: ReadonlyArray<StepOutcome<unknown>>,
): { totalDurationMs: number; steps: SyncSummaryStep[] } => {
  let totalDurationMs = 0;

  const steps: SyncSummaryStep[] = outcomes.map((outcome) => {
    if (outcome.status === 'ok') {
      totalDurationMs += outcome.durationMs;

      return {
        name: outcome.name,
        status: 'ok',
        fetched: outcome.result.fetched,
        created: outcome.result.created,
        updated: outcome.result.updated,
        errorCount: outcome.result.errors.length,
        durationMs: outcome.durationMs,
      };
    }

    if (outcome.status === 'failed') {
      totalDurationMs += outcome.durationMs;

      return {
        name: outcome.name,
        status: 'failed',
        fetched: 0,
        created: 0,
        updated: 0,
        errorCount: 1,
        durationMs: outcome.durationMs,
      };
    }

    return {
      name: outcome.name,
      status: 'skipped',
      fetched: 0,
      created: 0,
      updated: 0,
      errorCount: 0,
      durationMs: 0,
    };
  });

  return { totalDurationMs, steps };
};
