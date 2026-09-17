import { describe, expect, it } from 'vitest';

import { getBackfillProgressMessage } from 'src/front-components/utils/get-backfill-progress-message.util';

describe('getBackfillProgressMessage', () => {
  it('says nothing when no run has been recorded', () => {
    expect(getBackfillProgressMessage({ status: 'idle' })).toBeUndefined();
    expect(getBackfillProgressMessage(undefined)).toBeUndefined();
  });

  it('reports the fan-out before any job exists', () => {
    expect(
      getBackfillProgressMessage({
        status: 'enqueueing',
        startedAt: '2026-09-17T14:00:00.000Z',
      }),
    ).toBe('Counting records to back fill…');
  });

  it('counts completed batches while the run is in flight', () => {
    expect(
      getBackfillProgressMessage({
        status: 'running',
        startedAt: '2026-09-17T14:00:00.000Z',
        progress: {
          total: 512,
          completed: 340,
          failed: 0,
          running: 2,
          pending: 170,
        },
      }),
    ).toBe('Backfilling 340 of 512 batches.');
  });

  it('calls out failed batches', () => {
    expect(
      getBackfillProgressMessage({
        status: 'settled',
        startedAt: '2026-09-17T14:00:00.000Z',
        progress: {
          total: 10,
          completed: 9,
          failed: 1,
          running: 0,
          pending: 0,
        },
      }),
    ).toBe('Last backfill finished 10 batches, 1 batch failed.');
  });

  it('keeps the singular readable', () => {
    expect(
      getBackfillProgressMessage({
        status: 'settled',
        startedAt: '2026-09-17T14:00:00.000Z',
        progress: { total: 1, completed: 1, failed: 0, running: 0, pending: 0 },
      }),
    ).toBe('Last backfill finished 1 batch.');
  });
});
