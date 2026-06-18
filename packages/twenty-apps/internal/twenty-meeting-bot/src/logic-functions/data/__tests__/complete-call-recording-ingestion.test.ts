import { describe, expect, it, vi } from 'vitest';

import { completeCallRecordingIngestion } from 'src/logic-functions/data/complete-call-recording-ingestion.util';

describe('completeCallRecordingIngestion', () => {
  it('guards the flip with status != COMPLETED and returns true when the row is claimed', async () => {
    let capturedArgs: { filter: unknown; data: unknown } | undefined;
    const mutation = vi.fn(async (mutationArg: any) => {
      capturedArgs = mutationArg.updateCallRecordings.__args;

      return { updateCallRecordings: [{ id: 'call-recording-1' }] };
    });

    const claimed = await completeCallRecordingIngestion(
      { mutation } as never,
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(true);
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(capturedArgs?.filter).toEqual({
      id: { eq: 'call-recording-1' },
      status: { neq: 'COMPLETED' },
    });
    expect(capturedArgs?.data).toEqual({ status: 'COMPLETED' });
  });

  it('returns false when the row was already COMPLETED, so the loser cannot charge', async () => {
    const mutation = vi.fn(async () => ({ updateCallRecordings: [] }));

    const claimed = await completeCallRecordingIngestion(
      { mutation } as never,
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(false);
  });

  it('returns false when the API omits the result list', async () => {
    const mutation = vi.fn(async () => ({}));

    const claimed = await completeCallRecordingIngestion(
      { mutation } as never,
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(false);
  });
});
