import { describe, expect, it } from 'vitest';

import { getBackfillProgressPercentage } from 'src/front-components/utils/get-backfill-progress-percentage.util';

const STARTED_AT = '2026-09-17T14:00:00.000Z';

describe('getBackfillProgressPercentage', () => {
  it('has nothing to show before the jobs exist', () => {
    expect(getBackfillProgressPercentage(undefined)).toBeUndefined();
    expect(
      getBackfillProgressPercentage({ status: 'idle' }),
    ).toBeUndefined();
    expect(
      getBackfillProgressPercentage({
        status: 'enqueueing',
        startedAt: STARTED_AT,
      }),
    ).toBeUndefined();
  });

  it('scales completed batches to a percentage', () => {
    expect(
      getBackfillProgressPercentage({
        status: 'running',
        startedAt: STARTED_AT,
        progress: {
          total: 512,
          completed: 340,
          failed: 0,
          running: 2,
          pending: 170,
        },
      }),
    ).toBe(66);
  });

  it('stays short of full when a batch failed', () => {
    expect(
      getBackfillProgressPercentage({
        status: 'settled',
        startedAt: STARTED_AT,
        progress: { total: 10, completed: 9, failed: 1, running: 0, pending: 0 },
      }),
    ).toBe(90);
  });

  it('reports a run with no records to process as complete', () => {
    expect(
      getBackfillProgressPercentage({
        status: 'settled',
        startedAt: STARTED_AT,
        progress: { total: 0, completed: 0, failed: 0, running: 0, pending: 0 },
      }),
    ).toBe(100);
  });
});
