import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

const charge = vi.hoisted(() => vi.fn());
vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({ chargeCompletedCallRecording: charge }),
);
beforeEach(() => vi.resetAllMocks());

it('charges only the worker that completes the recording', async () => {
  const mutation = vi
    .fn()
    .mockResolvedValueOnce({ updateCallRecordings: [{ id: 'recording-1' }] })
    .mockResolvedValue({ updateCallRecordings: [] });
  const client = { mutation } as unknown as CoreApiClient;
  expect(
    await completeAndChargeCallRecording(client, { id: 'recording-1' }),
  ).toBe(true);
  expect(
    await completeAndChargeCallRecording(client, { id: 'recording-1' }),
  ).toBe(false);
  expect(charge).toHaveBeenCalledExactlyOnceWith(client, {
    callRecordingId: 'recording-1',
  });
});

it('does not replay a charge after an ambiguous failure', async () => {
  const mutation = vi
    .fn()
    .mockResolvedValueOnce({ updateCallRecordings: [{ id: 'recording-1' }] })
    .mockResolvedValue({ updateCallRecordings: [] });
  const client = { mutation } as unknown as CoreApiClient;
  charge.mockRejectedValueOnce(new Error('billing offline'));
  await expect(
    completeAndChargeCallRecording(client, { id: 'recording-1' }),
  ).rejects.toThrow('billing offline');
  await completeAndChargeCallRecording(client, { id: 'recording-1' });
  expect(charge).toHaveBeenCalledOnce();
});
