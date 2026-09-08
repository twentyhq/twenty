import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { getCallRecordingCharge } from 'src/logic-functions/flows/get-call-recording-charge.util';

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
  getCallRecordingCharge(client, { callRecordingId: 'recording-1' });

beforeEach(() => {
  vi.resetAllMocks();
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: 'recording-1',
            status: 'PROCESSING',
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

it('prepares the existing SDK charge using provider duration without charging', async () => {
  expect(await run()).toEqual({
    creditsUsedMicro: 500_000,
    quantity: 30,
    operationType: 'CALL_RECORDING',
    resourceContext: 'recall',
  });
  expect(charge).not.toHaveBeenCalled();
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
