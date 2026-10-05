import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, expect, it, vi } from 'vitest';
import { hydrateDesktopRecordingTimestamps } from 'src/logic-functions/flows/utils/hydrateDesktopRecordingTimestamps';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/utils/recoverDesktopRecordings';
import { type SyncableCallRecording } from 'src/logic-functions/types/SyncableCallRecording';

const { request, update, enqueue, retrieve } = vi.hoisted(() => ({
  request: vi.fn(),
  update: vi.fn(),
  enqueue: vi.fn(),
  retrieve: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/utils/getRecallApiConfig', () => ({
  getRecallApiConfig: () => ({ success: true, config: {} }),
}));
vi.mock('src/logic-functions/recall-api/utils/recallBotApiRequest', () => ({
  recallBotApiRequest: request,
}));
vi.mock('src/logic-functions/recall-api/utils/getRecallRecording', () => ({
  getRecallRecording: retrieve,
}));
vi.mock('src/logic-functions/data/utils/updateCallRecording', () => ({
  updateCallRecording: update,
}));
vi.mock(
  'src/logic-functions/data/utils/enqueueCallRecordingArtifactsImport',
  () => ({ enqueueCallRecordingArtifactsImport: enqueue }),
);
vi.mock('src/logic-functions/recall-api/utils/getOwnedDesktopUpload', () => ({
  getOwnedDesktopUpload: async () => {
    const response = await request();
    return response?.ok ? response.data : undefined;
  },
}));
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
            companionSession: {
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
    companionSession: { source: 'desktop', media: 'audio' },
    externalRecordingId: 'recall-1',
    startedAt: undefined,
    endedAt: undefined,
    status: 'PROCESSING',
    companionFailureReason: undefined,
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

it('does not reopen terminal transcript failures', async () => {
  const result = await query();
  const recording = result.callRecordings.edges[0].node;
  recording.status = 'FAILED';
  recording.transcript = {
    status: 'FAILED',
    recallTranscriptId: 'transcript-1',
    subCode: 'transcription_failed',
  };
  request.mockResolvedValue({
    ok: true,
    data: { recording_id: 'recall-1', status: { code: 'complete' } },
  });
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 0 });
  expect(update).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it('does not revive other failed calls whose transcript merely contains the word FAILED', async () => {
  const result = await query();
  const recording = result.callRecordings.edges[0].node;
  recording.status = 'FAILED';
  recording.transcript = [{ words: [{ text: 'FAILED' }] }];
  expect(
    await recoverDesktopRecordings(client, new Date('2026-09-07T12:20:00Z')),
  ).toEqual({ recovered: 0 });
  expect(mutation).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});
