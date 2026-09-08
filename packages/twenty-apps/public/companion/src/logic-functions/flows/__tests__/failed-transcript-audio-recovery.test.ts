import { expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';

const { listTranscripts, importMedia, charge } = vi.hoisted(() => ({
  listTranscripts: vi.fn(),
  importMedia: vi.fn(),
  charge: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/list-recall-transcripts.util', () => ({
  listRecallTranscripts: listTranscripts,
}));
vi.mock('src/logic-functions/flows/import-call-recording-media.util', () => ({
  importCallRecordingMedia: importMedia,
}));
vi.mock('src/logic-functions/flows/charge-completed-call-recording.util', () => ({ chargeCompletedCallRecording: charge }));

it('keeps a failed transcript recoverable until audio import succeeds', async () => {
  const recording: SyncableCallRecording = {
    id: 'recording-1',
    status: 'PROCESSING',
    companionSession: { source: 'desktop', media: 'audio' },
    externalRecordingId: 'provider-recording-1',
    startedAt: '2026-09-08T10:00:00Z',
    endedAt: '2026-09-08T10:01:00Z',
    transcript: undefined,
    companionFailureReason: undefined,
    audio: undefined,
    video: undefined,
  };
  const mutation = vi.fn(
    async (input: {
      updateCallRecording?: { __args: { data: object } };
      updateCallRecordings?: { __args: { data: object } };
    }) => {
      const data =
        input.updateCallRecording?.__args.data ??
        input.updateCallRecordings?.__args.data;
      Object.assign(recording, data);
      return { updateCallRecordings: [{ id: recording.id }] };
    },
  );
  const client = { mutation } as unknown as CoreApiClient;
  listTranscripts.mockResolvedValue({
    ok: true,
    transcripts: [
      {
        id: 'transcript-1',
        statusCode: 'failed',
        statusSubCode: 'provider_error',
      },
    ],
  });
  importMedia
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({
      audio: [{ fileId: 'saved-audio', label: 'audio.mp3' }],
    });
  const sync = () =>
    syncCallRecording({
      client,
      callRecording: { ...recording },
      requestedAt: '2026-09-08T10:02:00Z',
    });

  await sync();
  expect(recording.status).toBe('PROCESSING');
  expect(recording.transcript).toMatchObject({ status: 'FAILED' });
  expect(recording.audio).toBeUndefined();
  expect(charge).not.toHaveBeenCalled();

  await sync();
  expect(recording.status).toBe('COMPLETED');
  expect(recording.audio).toEqual([
    { fileId: 'saved-audio', label: 'audio.mp3' },
  ]);
  expect(recording.transcript).toMatchObject({ status: 'FAILED' });
  expect(listTranscripts).toHaveBeenCalledOnce();
  expect(charge).toHaveBeenCalledOnce();
});
