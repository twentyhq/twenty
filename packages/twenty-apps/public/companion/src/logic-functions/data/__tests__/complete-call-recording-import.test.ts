import { describe, expect, it, vi } from 'vitest';

import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';

describe('completeCallRecordingImport', () => {
  it('guards the flip with non-terminal statuses and returns true when the row is claimed', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValue({
        updateCallRecordings: [{ id: 'call-recording-1' }],
      });

    const claimed = await completeCallRecordingImport(
      { mutation },
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(true);
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            status: { in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'] },
          },
          data: { status: 'COMPLETED' },
        },
        id: true,
      },
    });
  });

  it('returns false when the row was already COMPLETED', async () => {
    const mutation = vi.fn().mockResolvedValue({ updateCallRecordings: [] });

    const claimed = await completeCallRecordingImport(
      { mutation },
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(false);
  });

  it('returns false when the API omits the result list', async () => {
    const mutation = vi.fn().mockResolvedValue({});

    const claimed = await completeCallRecordingImport(
      { mutation },
      {
        id: 'call-recording-1',
      },
    );

    expect(claimed).toBe(false);
  });
});
