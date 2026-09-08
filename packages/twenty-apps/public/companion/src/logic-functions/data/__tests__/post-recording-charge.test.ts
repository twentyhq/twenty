import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { postRecordingCharge } from 'src/logic-functions/data/post-recording-charge.util';

const charge = { creditsUsedMicro: 100, quantityMinutes: 2 };
const request = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', request);
  vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'user-token');
  vi.stubEnv('TWENTY_API_URL', 'https://twenty.test/');
  vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('reuses the recording identity and requires a durable receipt', async () => {
  request.mockImplementation(async () =>
    Response.json({ status: 'accepted', receiptId: 'receipt-1' }),
  );
  expect(await postRecordingCharge('recording-1', charge)).toEqual({
    status: 'ACCEPTED',
    receiptId: 'receipt-1',
  });
  expect(
    new Headers(request.mock.calls[0][1].headers).get('Authorization'),
  ).toBe('Bearer application-token');
  expect(request.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  await postRecordingCharge('recording-1', charge);
  expect(request.mock.calls[1][1].body).toBe(request.mock.calls[0][1].body);
  expect(JSON.parse(request.mock.calls[0][1].body)).toMatchObject({
    idempotencyKey: 'companion-recording:recording-1',
    quantity: 2,
  });
});

it.each([400, 404, 409, 500, 503])(
  'propagates HTTP %s instead of discarding the charge',
  async (status) => {
    request.mockResolvedValue(new Response(null, { status }));
    await expect(postRecordingCharge('recording-1', charge)).rejects.toThrow(
      `status ${status}`,
    );
  },
);

it('does not mistake an empty successful response for accepted billing', async () => {
  request.mockResolvedValue(Response.json({}));
  await expect(postRecordingCharge('recording-1', charge)).rejects.toThrow(
    'durable receipt',
  );
});

it('records disabled billing only when the server explicitly confirms it', async () => {
  request.mockResolvedValue(Response.json({ status: 'disabled' }));
  expect(await postRecordingCharge('recording-1', charge)).toEqual({
    status: 'DISABLED',
  });
});

it('propagates an uncertain network outcome so the same key can be retried', async () => {
  request.mockRejectedValue(new Error('connection interrupted'));
  await expect(postRecordingCharge('recording-1', charge)).rejects.toThrow(
    'connection interrupted',
  );
});
