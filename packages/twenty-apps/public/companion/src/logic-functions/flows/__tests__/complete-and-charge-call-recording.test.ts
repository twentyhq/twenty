import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

const { charge, prepare } = vi.hoisted(() => ({
  charge: vi.fn(),
  prepare: vi.fn(),
}));
vi.mock('twenty-sdk/billing', () => ({ chargeCredits: charge }));
vi.mock('src/logic-functions/flows/get-call-recording-charge.util', () => ({
  getCallRecordingCharge: prepare,
}));
const chargeInput = {
  creditsUsedMicro: 500_000,
  quantity: 30,
  operationType: 'CALL_RECORDING',
  resourceContext: 'recall',
};
beforeEach(() => {
  vi.resetAllMocks();
  prepare.mockResolvedValue(chargeInput);
});

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
  expect(charge).toHaveBeenCalledExactlyOnceWith(chargeInput);
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

it('leaves the completion fence untouched when provider validation fails', async () => {
  const mutation = vi.fn();
  prepare.mockRejectedValue(new Error('duration unavailable'));
  await expect(
    completeAndChargeCallRecording({ mutation } as unknown as CoreApiClient, {
      id: 'recording-1',
    }),
  ).rejects.toThrow('duration unavailable');
  expect(mutation).not.toHaveBeenCalled();
  expect(charge).not.toHaveBeenCalled();
});
