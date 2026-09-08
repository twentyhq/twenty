import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  hydrateDesktopRecordingTimestamps,
  recoverDesktopRecordings,
} from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { type SyncableCallRecording } from 'src/logic-functions/flows/sync-call-recording.util';

const { request, update, enqueue, retrieve } = vi.hoisted(() => ({
  request: vi.fn(),
  update: vi.fn(),
  enqueue: vi.fn(),
  retrieve: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/get-recall-api-config.util', () => ({
  getRecallApiConfig: () => ({ success: true, config: {} }),
}));
vi.mock('src/logic-functions/recall-api/recall-bot-api-request.util', () => ({
  recallBotApiRequest: request,
}));
vi.mock('src/logic-functions/recall-api/get-recall-recording.util', () => ({
  getRecallRecording: retrieve,
}));
vi.mock('src/logic-functions/data/update-call-recording.util', () => ({
  updateCallRecording: update,
}));
vi.mock(
  'src/logic-functions/data/enqueue-call-recording-artifacts-import.util',
  () => ({ enqueueCallRecordingArtifactsImport: enqueue }),
);
const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;
beforeEach(() => {
  vi.resetAllMocks();
  mutation.mockResolvedValue({ updateCallRecordings: [{ id: 'desktop-1' }] });
  update.mockResolvedValue(true);
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: 'desktop-1',
            createdAt: '2026-09-07T12:00:00Z',
            updatedAt: '2026-09-07T12:00:00Z',
            desktopRecordingSession: {
              source: 'desktop',
              media: 'audio',
              sdkUploadId: 'upload-1',
            },
          },
        },
      ],
    },
  });
});
it('recovers a missed desktop completion webhook into the shared durable import queue', async () => {
  request.mockResolvedValue({
    ok: true,
    data: { recording_id: 'recall-1', status: { code: 'complete' } },
  });
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 1 });
  expect(update).toHaveBeenCalledWith(client, {
    id: 'desktop-1',
    expectedStatuses: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'],
    data: { externalRecordingId: 'recall-1', status: 'PROCESSING' },
  });
  expect(enqueue).toHaveBeenCalledWith({ callRecordingId: 'desktop-1' });
});
it('recovers timestamps from Recall after out-of-order lifecycle events', async () => {
  retrieve.mockResolvedValue({
    ok: true,
    recording: {
      started_at: '2026-09-07T12:00:00.123456Z',
      completed_at: '2026-09-07T12:05:00.123456Z',
    },
  });
  const recording: SyncableCallRecording = {
    id: 'desktop-1',
    desktopRecordingSession: { source: 'desktop', media: 'audio' },
    externalRecordingId: 'recall-1',
    startedAt: undefined,
    endedAt: undefined,
    status: 'PROCESSING',
    callRecorderFailureReason: undefined,
    transcript: undefined,
    audio: undefined,
    video: undefined,
  };
  await hydrateDesktopRecordingTimestamps(client, recording);
  expect(recording.startedAt).toBe('2026-09-07T12:00:00.123Z');
  expect(recording.endedAt).toBe('2026-09-07T12:05:00.123Z');
});
it('does not enqueue incomplete uploads or retry failures blindly', async () => {
  request.mockResolvedValue({
    ok: true,
    data: { recording_id: null, status: { code: 'recording_started' } },
  });
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 0 });
  expect(update).not.toHaveBeenCalled();
  expect(enqueue).not.toHaveBeenCalled();
});

it('does not recover a recording changed after the recovery batch was read', async () => {
  mutation.mockResolvedValue({ updateCallRecordings: [] });
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 0 });
  expect(request).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(enqueue).not.toHaveBeenCalled();
});
it('does not reopen a recording completed while Recall was being queried', async () => {
  request.mockResolvedValue({
    ok: true,
    data: { recording_id: 'recall-1', status: { code: 'complete' } },
  });
  update.mockResolvedValue(false);
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 0 });
  expect(enqueue).not.toHaveBeenCalled();
});
