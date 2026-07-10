import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  reconcileCallRecording,
  type ReconcilableCallRecording,
} from 'src/logic-functions/flows/reconcile-call-recording.util';

const reconcileCallRecordingTranscriptArtifactMock = vi.hoisted(() => vi.fn());
const ingestCallRecordingMediaMock = vi.hoisted(() => vi.fn());
const persistCallRecordingProgressMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util',
  () => ({
    reconcileCallRecordingTranscriptArtifact:
      reconcileCallRecordingTranscriptArtifactMock,
  }),
);

vi.mock('src/logic-functions/flows/ingest-call-recording-media.util', () => ({
  ingestCallRecordingMedia: ingestCallRecordingMediaMock,
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
  overrides: Partial<ReconcilableCallRecording> = {},
): ReconcilableCallRecording => ({
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

describe('reconcileCallRecording', () => {
  beforeEach(() => {
    reconcileCallRecordingTranscriptArtifactMock.mockReset();
    reconcileCallRecordingTranscriptArtifactMock.mockResolvedValue({
      updateData: {},
      requestedTranscript: false,
    });
    ingestCallRecordingMediaMock.mockReset();
    ingestCallRecordingMediaMock.mockResolvedValue({});
    persistCallRecordingProgressMock.mockReset();
    persistCallRecordingProgressMock.mockResolvedValue({
      completesIngestion: false,
    });
  });

  it('reports unchanged without touching artifacts when there is no bot snapshot and no recording id', async () => {
    const result = await reconcileCallRecording({
      client,
      callRecording: buildCallRecording(),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(reconcileCallRecordingTranscriptArtifactMock).not.toHaveBeenCalled();
    expect(ingestCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(persistCallRecordingProgressMock).not.toHaveBeenCalled();
    expect(result).toEqual({ updated: false, requestedTranscript: false });
  });

  it('reconciles artifacts from the row recording id on a done signal without a bot snapshot', async () => {
    reconcileCallRecordingTranscriptArtifactMock.mockResolvedValue({
      updateData: { transcript: { status: 'PENDING' } },
      requestedTranscript: true,
    });

    const result = await reconcileCallRecording({
      client,
      callRecording: buildCallRecording({
        status: 'PROCESSING',
        externalRecordingId: 'recall-recording-1',
      }),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(reconcileCallRecordingTranscriptArtifactMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      currentStatus: 'PROCESSING',
      externalRecordingId: 'recall-recording-1',
      requestedAt: REQUESTED_AT,
      transcript: undefined,
    });
    expect(ingestCallRecordingMediaMock).toHaveBeenCalledWith({
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

  it('gates artifacts on bot-reported doneness while still filling convergence fields', async () => {
    const result = await reconcileCallRecording({
      client,
      callRecording: buildCallRecording({
        externalRecordingId: 'recall-recording-1',
      }),
      bot: {
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
      treatRecordingAsDone: false,
      requestedAt: REQUESTED_AT,
    });

    expect(reconcileCallRecordingTranscriptArtifactMock).not.toHaveBeenCalled();
    expect(ingestCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(persistCallRecordingProgressMock).toHaveBeenCalledWith(client, {
      id: 'call-recording-1',
      current: expect.objectContaining({ id: 'call-recording-1' }),
      updateData: { startedAt: '2026-06-09T13:02:00.000Z' },
    });
    expect(result).toEqual({ updated: true, requestedTranscript: false });
  });

  it('fails the recording when the bot reports done without ever exposing a recording', async () => {
    const result = await reconcileCallRecording({
      client,
      callRecording: buildCallRecording(),
      bot: {
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
});
