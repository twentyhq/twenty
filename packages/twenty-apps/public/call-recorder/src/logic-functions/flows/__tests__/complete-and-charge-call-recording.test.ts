import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

const fetchMock = vi.fn();
const mutationMock = vi.fn();
const TWENTY_API_URL = 'https://twenty.example.com';
const CALL_RECORDING = {
  id: 'call-recording-1',
  startedAt: '2026-06-10T12:00:00.000Z',
  endedAt: '2026-06-10T13:00:00.000Z',
};

describe('completeAndChargeCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_API_URL', TWENTY_API_URL);
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('charges exactly once when this path wins the completion claim', async () => {
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: CALL_RECORDING.id }],
    });

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      CALL_RECORDING,
    );

    expect(claimed).toBe(true);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: CALL_RECORDING.id },
            status: {
              in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'],
            },
          },
          data: { status: 'COMPLETED' },
        },
        id: true,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not charge when another path already completed the recording', async () => {
    mutationMock.mockResolvedValue({ updateCallRecordings: [] });

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      CALL_RECORDING,
    );

    expect(claimed).toBe(false);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reopens the completion claim when the charge is definitely rejected', async () => {
    mutationMock
      .mockResolvedValueOnce({
        updateCallRecordings: [{ id: CALL_RECORDING.id }],
      })
      .mockResolvedValueOnce({
        updateCallRecording: { id: CALL_RECORDING.id },
      });
    fetchMock.mockResolvedValue(
      new Response('Too Many Requests', { status: 429 }),
    );

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      CALL_RECORDING,
    );

    expect(claimed).toBe(false);
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock).toHaveBeenNthCalledWith(2, {
      updateCallRecording: {
        __args: {
          id: CALL_RECORDING.id,
          data: { status: 'PROCESSING' },
        },
        id: true,
      },
    });
  });

  it('keeps the recording completed when the charge outcome is ambiguous', async () => {
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: CALL_RECORDING.id }],
    });
    fetchMock.mockRejectedValue(new Error('socket hang up'));

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      CALL_RECORDING,
    );

    expect(claimed).toBe(true);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the recording completed when billing is disabled on the instance', async () => {
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: CALL_RECORDING.id }],
    });
    fetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      CALL_RECORDING,
    );

    expect(claimed).toBe(true);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });
});
