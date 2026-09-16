import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { syncCallRecording } from 'src/logic-functions/flows/utils/syncCallRecording';
import { type SyncableCallRecording } from 'src/logic-functions/types/SyncableCallRecording';

const { listTranscripts, importMedia, charge } = vi.hoisted(() => ({
  listTranscripts: vi.fn(),
  importMedia: vi.fn(),
  charge: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/utils/listRecallTranscripts', () => ({
  listRecallTranscripts: listTranscripts,
}));
vi.mock('src/logic-functions/flows/utils/importCallRecordingMedia', () => ({
  importCallRecordingMedia: importMedia,
}));
vi.mock('twenty-sdk/billing', () => ({ chargeCredits: charge }));

beforeEach(() => vi.clearAllMocks());

it.each([false, true])(
  'terminates a failed transcript after audio recovery (oversized: %s)',
  async (oversized) => {
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
    importMedia.mockResolvedValueOnce({}).mockResolvedValueOnce(
      oversized
        ? { companionFailureReason: 'audio_file_too_large' }
        : {
            audio: [{ fileId: 'saved-audio', label: 'audio.mp3' }],
          },
    );
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
    expect(recording.status).toBe('FAILED');
    if (oversized)
      expect(recording.companionFailureReason).toContain(
        'audio_file_too_large',
      );
    else
      expect(recording.audio).toEqual([
        { fileId: 'saved-audio', label: 'audio.mp3' },
      ]);
    expect(recording.transcript).toMatchObject({ status: 'FAILED' });
    expect(listTranscripts).toHaveBeenCalledTimes(2);
    expect(charge).not.toHaveBeenCalled();
  },
);
