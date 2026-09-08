import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

const charge = vi.hoisted(() => vi.fn());
vi.mock('src/logic-functions/flows/charge-completed-call-recording.util', () => ({ chargeCompletedCallRecording: charge }));
beforeEach(() => vi.resetAllMocks());

it('atomically saves a pending charge with completion and preserves it when billing fails', async () => {
  const mutation = vi.fn().mockResolvedValue({ updateCallRecordings: [{ id: 'recording-1' }] });
  const client = { mutation } as unknown as CoreApiClient;
  charge.mockRejectedValueOnce(new Error('billing offline'));
  await expect(completeAndChargeCallRecording(client, { id: 'recording-1' })).rejects.toThrow('billing offline');
  expect(mutation).toHaveBeenCalledWith(expect.objectContaining({ updateCallRecordings: expect.objectContaining({ __args: expect.objectContaining({ data: { status: 'COMPLETED', companionBillingState: { status: 'PENDING' } } }) }) }));
  mutation.mockResolvedValue({ updateCallRecordings: [] });
  await completeAndChargeCallRecording(client, { id: 'recording-1' });
  expect(charge).toHaveBeenCalledTimes(2);
  expect(charge).toHaveBeenLastCalledWith(client, { callRecordingId: 'recording-1' });
});
