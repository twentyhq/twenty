import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

const { charge, ownedUpload, provider } = vi.hoisted(() => ({
  charge: vi.fn(),
  ownedUpload: vi.fn(),
  provider: vi.fn(),
}));
vi.mock('twenty-sdk/billing', () => ({ chargeCredits: charge }));
vi.mock('src/logic-functions/recall-api/get-owned-desktop-upload.util', () => ({
  getOwnedDesktopUpload: ownedUpload,
}));
vi.mock('src/logic-functions/recall-api/get-recall-recording.util', () => ({
  getRecallRecording: provider,
}));
const query = vi.fn();
const client = { query } as unknown as CoreApiClient;
const run = () =>
  chargeCompletedCallRecording(client, { callRecordingId: 'recording-1' });

beforeEach(() => {
  vi.resetAllMocks();
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: 'recording-1',
            status: 'COMPLETED',
            companionSession: { source: 'desktop', media: 'audio' },
            externalRecordingId: 'provider-1',
          },
        },
      ],
    },
  });
  ownedUpload.mockResolvedValue({
    id: 'upload-1',
    recording_id: 'provider-1',
    status: { code: 'complete' },
  });
  provider.mockResolvedValue({
    ok: true,
    recording: {
      started_at: '2026-09-08T10:00:00Z',
      completed_at: '2026-09-08T10:30:00Z',
    },
  });
});

it('uses the existing SDK billing API with provider duration', async () => {
  await run();
  expect(charge).toHaveBeenCalledExactlyOnceWith({
    creditsUsedMicro: 500_000,
    quantity: 30,
    operationType: 'CALL_RECORDING',
    resourceContext: 'recall',
  });
});

it('does not retry an ambiguous charge response', async () => {
  charge.mockRejectedValue(new Error('offline'));
  await expect(run()).rejects.toThrow('offline');
  expect(charge).toHaveBeenCalledOnce();
});

it('does not bill an unknown provider duration', async () => {
  provider.mockResolvedValue({ ok: true, recording: {} });
  await expect(run()).rejects.toThrow('no usable provider duration');
  expect(charge).not.toHaveBeenCalled();
});

it('does not bill forged provider IDs', async () => {
  ownedUpload.mockResolvedValue(undefined);
  await expect(run()).rejects.toThrow('owned desktop upload');
  expect(provider).not.toHaveBeenCalled();
  expect(charge).not.toHaveBeenCalled();
});
