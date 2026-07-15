import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

const fetchMock = vi.fn();
const TWENTY_API_URL = 'https://twenty.example.com';

describe('chargeCompletedCallRecording', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_API_URL', TWENTY_API_URL);
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('charges prorated micro-credits with the recording duration in minutes', async () => {
    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('charged');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];

    expect(requestUrl).toBe(`${TWENTY_API_URL}/app/billing/charge`);
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          creditsUsedMicro: 500_000,
          quantity: 30,
          operationType: 'CALL_RECORDING',
          resourceContext: 'recall',
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(new Headers(requestInit.headers).get('Authorization')).toBe(
      'Bearer app-access-token',
    );
  });

  it('skips and warns loudly when timestamps are unusable', async () => {
    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: undefined,
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('unbillable');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('will not be billed'),
    );
  });

  it('surfaces a rejected charge so the caller can reopen completion', async () => {
    fetchMock.mockResolvedValue(
      new Response('Too Many Requests', { status: 429 }),
    );

    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('rejected');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('was rejected'),
    );
  });

  it('warns without failing when the charge outcome is unknown', async () => {
    fetchMock.mockRejectedValue(new Error('socket hang up'));

    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('unknown');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('did not confirm'),
    );
  });
});
