import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

const { post, ownedUpload, provider } = vi.hoisted(() => ({ post: vi.fn(), ownedUpload: vi.fn(), provider: vi.fn() }));
vi.mock('src/logic-functions/data/post-recording-charge.util', () => ({ postRecordingCharge: post }));
vi.mock('src/logic-functions/recall-api/get-owned-desktop-upload.util', () => ({ getOwnedDesktopUpload: ownedUpload }));
vi.mock('src/logic-functions/recall-api/get-recall-recording.util', () => ({ getRecallRecording: provider }));
const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;
let recording: { id: string; status: string; companionSession: object; companionBillingState?: object; externalRecordingId: string };
const run = () => chargeCompletedCallRecording(client, { callRecordingId: 'recording-1' });

beforeEach(() => {
  vi.resetAllMocks();
  recording = { id: 'recording-1', status: 'COMPLETED', companionSession: { source: 'desktop', media: 'audio' }, companionBillingState: { status: 'PENDING' }, externalRecordingId: 'provider-1' };
  query.mockImplementation(async () => ({ callRecordings: { edges: [{ node: recording }] } }));
  mutation.mockImplementation(async (input: { updateCallRecordings: { __args: { data: object } } }) => { Object.assign(recording, input.updateCallRecordings.__args.data); return { updateCallRecordings: [{ id: recording.id }] }; });
  ownedUpload.mockResolvedValue({ id: 'upload-1', recording_id: 'provider-1', status: { code: 'complete' } });
  provider.mockResolvedValue({ ok: true, recording: { started_at: '2026-09-08T10:00:00Z', completed_at: '2026-09-08T10:30:00Z' } });
  post.mockResolvedValue({ status: 'ACCEPTED', receiptId: 'receipt-1' });
});

it('bills provider duration and saves the durable receipt independently of recording status', async () => {
  await run();
  expect(post).toHaveBeenCalledWith('recording-1', { creditsUsedMicro: 500_000, quantityMinutes: 30 });
  expect(recording.companionBillingState).toEqual({ status: 'ACCEPTED', receiptId: 'receipt-1' });
});

it('leaves failed charges pending and retries completed recordings', async () => {
  post.mockRejectedValueOnce(new Error('offline'));
  await expect(run()).rejects.toThrow('offline');
  expect(recording.companionBillingState).toEqual({ status: 'PENDING' });
  expect(mutation).not.toHaveBeenCalled();
  await run();
  expect(post.mock.calls[1]).toEqual(post.mock.calls[0]);
  expect(recording.companionBillingState).toMatchObject({ status: 'ACCEPTED' });
});

it('retries the same charge when saving an acknowledged receipt fails', async () => {
  mutation.mockRejectedValueOnce(new Error('save failed'));
  await expect(run()).rejects.toThrow('save failed');
  await run();
  expect(post.mock.calls[1]).toEqual(post.mock.calls[0]);
});

it.each([{ status: 'ACCEPTED', receiptId: 'receipt-1' }, { status: 'DISABLED' }, undefined])('does not rebill acknowledged or historical recordings (%j)', async (state) => {
  recording.companionBillingState = state;
  await run();
  expect(post).not.toHaveBeenCalled();
});

it('keeps unknown provider durations pending instead of losing the charge', async () => {
  provider.mockResolvedValue({ ok: true, recording: {} });
  await expect(run()).rejects.toThrow('no usable provider duration');
  expect(post).not.toHaveBeenCalled();
  expect(mutation).not.toHaveBeenCalled();
});

it('does not bill forged provider IDs', async () => {
  ownedUpload.mockResolvedValue(undefined);
  await expect(run()).rejects.toThrow('owned desktop upload');
  expect(provider).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
});
