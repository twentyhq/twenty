import { describe, expect, it } from 'vitest';

import { getBackfillProgressMessage } from 'src/front-components/utils/get-backfill-progress-message.util';

const STARTED_AT = '2026-09-17T14:00:00.000Z';

describe('getBackfillProgressMessage', () => {
  it('says nothing when no run has been recorded', () => {
    expect(getBackfillProgressMessage({ status: 'idle' })).toBeUndefined();
    expect(getBackfillProgressMessage(undefined)).toBeUndefined();
  });

  it('reports the fan-out before any job exists', () => {
    expect(
      getBackfillProgressMessage({
        status: 'enqueueing',
        startedAt: STARTED_AT,
      }),
    ).toBe('Counting records…');
  });

  it('counts completed batches while the run is in flight', () => {
    expect(
      getBackfillProgressMessage({
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
    ).toBe('340 of 512 batches');
  });

  it('calls out failures on a settled run', () => {
    expect(
      getBackfillProgressMessage({
        status: 'settled',
        startedAt: STARTED_AT,
        progress: { total: 10, completed: 9, failed: 1, running: 0, pending: 0 },
      }),
    ).toBe('10 batches done, 1 failed');
  });

  it('calls out failures while the run is still going', () => {
    expect(
      getBackfillProgressMessage({
        status: 'running',
        startedAt: STARTED_AT,
        progress: { total: 10, completed: 4, failed: 1, running: 1, pending: 4 },
      }),
    ).toBe('4 of 10 batches, 1 failed');
  });
});
