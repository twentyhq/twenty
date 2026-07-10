import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';

const importCallRecordingTranscriptMock = vi.hoisted(() => vi.fn());
const importCallRecordingMediaMock = vi.hoisted(() => vi.fn());
const persistCallRecordingProgressMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/import-call-recording-transcript.util',
  () => ({
    importCallRecordingTranscript: importCallRecordingTranscriptMock,
  }),
);

vi.mock('src/logic-functions/flows/import-call-recording-media.util', () => ({
  importCallRecordingMedia: importCallRecordingMediaMock,
}));

vi.mock(
  'src/logic-functions/flows/persist-call-recording-progress.util',
  () => ({
    persistCallRecordingProgress: persistCallRecordingProgressMock,
  }),
);

const client = {} as CoreApiClient;
const REQUESTED_AT = '2026-06-09T14:06:00.000Z';

const buildCallRecording = (
  overrides: Partial<SyncableCallRecording> = {},
): SyncableCallRecording => ({
  id: 'call-recording-1',
  status: 'RECORDING',
  startedAt: undefined,
  endedAt: undefined,
  externalRecordingId: undefined,
  callRecorderFailureReason: undefined,
  transcript: undefined,
  audio: undefined,
  video: undefined,
  ...overrides,
});

describe('syncCallRecording', () => {
  beforeEach(() => {
    importCallRecordingTranscriptMock.mockReset();
    importCallRecordingTranscriptMock.mockResolvedValue({
      updateData: {},
      requestedTranscript: false,
    });
    importCallRecordingMediaMock.mockReset();
    importCallRecordingMediaMock.mockResolvedValue({});
    persistCallRecordingProgressMock.mockReset();
    persistCallRecordingProgressMock.mockResolvedValue({
      completesImport: false,
    });
  });

  it('reports unchanged without touching artifacts when there is no bot snapshot and no recording id', async () => {
    const result = await syncCallRecording({
      client,
      callRecording: buildCallRecording(),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(importCallRecordingTranscriptMock).not.toHaveBeenCalled();
    expect(importCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(persistCallRecordingProgressMock).not.toHaveBeenCalled();
    expect(result).toEqual({ updated: false, requestedTranscript: false });
  });

  it('reconciles artifacts from the row recording id on a done signal without a bot snapshot', async () => {
    importCallRecordingTranscriptMock.mockResolvedValue({
      updateData: { transcript: { status: 'PENDING' } },
      requestedTranscript: true,
    });

    const result = await syncCallRecording({
      client,
      callRecording: buildCallRecording({
        status: 'PROCESSING',
        externalRecordingId: 'recall-recording-1',
      }),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(importCallRecordingTranscriptMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      currentStatus: 'PROCESSING',
      externalRecordingId: 'recall-recording-1',
      requestedAt: REQUESTED_AT,
      transcript: undefined,
    });
    expect(importCallRecordingMediaMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });
    expect(persistCallRecordingProgressMock).toHaveBeenCalledWith(client, {
      id: 'call-recording-1',
      current: expect.objectContaining({ id: 'call-recording-1' }),
      updateData: { transcript: { status: 'PENDING' } },
    });
    expect(result).toEqual({ updated: true, requestedTranscript: true });
  });

  it('gates artifacts on bot-reported doneness while still filling syncState fields', async () => {
    const result = await syncCallRecording({
      client,
      callRecording: buildCallRecording({
        externalRecordingId: 'recall-recording-1',
      }),
      bot: {
        id: undefined,
        metadata: {},
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
      treatRecordingAsDone: false,
      requestedAt: REQUESTED_AT,
    });

    expect(importCallRecordingTranscriptMock).not.toHaveBeenCalled();
    expect(importCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(persistCallRecordingProgressMock).toHaveBeenCalledWith(client, {
      id: 'call-recording-1',
      current: expect.objectContaining({ id: 'call-recording-1' }),
      updateData: { startedAt: '2026-06-09T13:02:00.000Z' },
    });
    expect(result).toEqual({ updated: true, requestedTranscript: false });
  });

  it('fails the recording when the bot reports done without ever exposing a recording', async () => {
    const result = await syncCallRecording({
      client,
      callRecording: buildCallRecording(),
      bot: {
        id: undefined,
        metadata: {},
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [],
      },
      treatRecordingAsDone: false,
      requestedAt: REQUESTED_AT,
    });

    expect(persistCallRecordingProgressMock).toHaveBeenCalledWith(client, {
      id: 'call-recording-1',
      current: expect.objectContaining({ id: 'call-recording-1' }),
      updateData: {
        status: 'FAILED',
        callRecorderFailureReason: 'recording_artifacts_unavailable',
      },
    });
    expect(result).toEqual({ updated: true, requestedTranscript: false });
  });

  it('keeps the failure reason of a failing update over a media size marker', async () => {
    importCallRecordingTranscriptMock.mockResolvedValue({
      updateData: {
        status: 'FAILED',
        callRecorderFailureReason: 'transcript_failed:audio_missing',
        transcript: { status: 'FAILED' },
      },
      requestedTranscript: false,
    });
    importCallRecordingMediaMock.mockResolvedValue({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: 'video_file_too_large',
    });

    await syncCallRecording({
      client,
      callRecording: buildCallRecording({
        status: 'PROCESSING',
        externalRecordingId: 'recall-recording-1',
      }),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(persistCallRecordingProgressMock).toHaveBeenCalledWith(client, {
      id: 'call-recording-1',
      current: expect.objectContaining({ id: 'call-recording-1' }),
      updateData: {
        status: 'FAILED',
        callRecorderFailureReason: 'transcript_failed:audio_missing',
        transcript: { status: 'FAILED' },
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      },
    });
  });
});
