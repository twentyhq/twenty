import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileCallRecordingAudioArtifacts } from 'src/logic-functions/flows/reconcile-call-recording-audio-artifacts.util';
import { reconcileCallRecordingTranscriptArtifacts } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifacts.util';
import { reconcileCallRecordingVideoArtifacts } from 'src/logic-functions/flows/reconcile-call-recording-video-artifacts.util';

const ingestCallRecordingAudioMock = vi.hoisted(() => vi.fn());
const ingestCallRecordingVideoMock = vi.hoisted(() => vi.fn());
const reconcileCallRecordingTranscriptArtifactMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());

const NOW = new Date('2026-01-01T14:10:00.000Z');

vi.mock('src/logic-functions/flows/ingest-call-recording-media.util', () => ({
  ingestCallRecordingAudio: ingestCallRecordingAudioMock,
  ingestCallRecordingVideo: ingestCallRecordingVideoMock,
}));

vi.mock(
  'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util',
  () => ({
    reconcileCallRecordingTranscriptArtifact:
      reconcileCallRecordingTranscriptArtifactMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: chargeCompletedCallRecordingMock,
  }),
);

type CallRecordingNode = Record<string, unknown>;

class FakeCoreApiClient {
  public readonly mutations: Array<{ id: string; data: Record<string, unknown> }> =
    [];
  public lastQuery: Record<string, unknown> | undefined;

  constructor(private readonly callRecordingNodes: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    this.lastQuery = query;

    return {
      callRecordings: {
        edges: this.callRecordingNodes.map((node) => ({ node })),
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const id = filter.id.eq;

      this.mutations.push({ id, data });

      return { updateCallRecordings: [{ id }] };
    }

    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

const buildCandidateNode = (
  overrides: CallRecordingNode = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'PROCESSING',
  startedAt: '2026-01-01T13:02:00.000Z',
  endedAt: '2026-01-01T14:05:00.000Z',
  externalRecordingId: 'recall-recording-1',
  transcript: null,
  audio: null,
  video: null,
  ...overrides,
});

const buildExpectedRecentCallRecordingFilter = (now: Date) => {
  const lowerBound = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lowerBoundIsoString = lowerBound.toISOString();

  return {
    or: [
      { createdAt: { gte: lowerBoundIsoString } },
      { startedAt: { gte: lowerBoundIsoString } },
      { endedAt: { gte: lowerBoundIsoString } },
      { calendarEvent: { startsAt: { gte: lowerBoundIsoString } } },
      { calendarEvent: { endsAt: { gte: lowerBoundIsoString } } },
    ],
  };
};

describe('call recording artifact reconciliation', () => {
  beforeEach(() => {
    ingestCallRecordingAudioMock.mockReset();
    ingestCallRecordingAudioMock.mockResolvedValue({ outcome: 'missing-url' });
    ingestCallRecordingVideoMock.mockReset();
    ingestCallRecordingVideoMock.mockResolvedValue({ outcome: 'missing-url' });
    reconcileCallRecordingTranscriptArtifactMock.mockReset();
    reconcileCallRecordingTranscriptArtifactMock.mockResolvedValue({
      updateData: {},
      requestedTranscript: false,
    });
    chargeCompletedCallRecordingMock.mockReset();
    chargeCompletedCallRecordingMock.mockResolvedValue(undefined);
  });

  it('persists a video artifact and completes through the existing completion claim when it is the last artifact', async () => {
    ingestCallRecordingVideoMock.mockResolvedValue({
      outcome: 'uploaded',
      updateData: {
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      },
    });
    const client = new FakeCoreApiClient([
      buildCandidateNode({
        transcript: [{ participant: { id: 1 }, words: [] }],
        audio: [{ fileId: 'file-audio-1' }],
      }),
    ]);

    const result = await reconcileCallRecordingVideoArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(ingestCallRecordingVideoMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasVideo: false,
    });
    expect(client.lastQuery).toMatchObject({
      callRecordings: {
        __args: {
          filter: {
            and: [
              { video: { is: 'NULL' } },
              buildExpectedRecentCallRecordingFilter(NOW),
            ],
          },
          first: 5,
        },
      },
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { video: [{ fileId: 'file-video-1', label: 'video.mp4' }] },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:05:00.000Z',
    });
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingCount: 1,
      skippedAlreadyPresentCount: 0,
      skippedMissingRecordingIdCount: 0,
      skippedMissingUrlCount: 0,
      skippedSizeUnavailableCount: 0,
      skippedTooLargeCount: 0,
      failedCount: 0,
      deferredCallRecordingCount: 0,
    });
  });

  it('counts too-large video artifacts and defers the candidate without completing', async () => {
    ingestCallRecordingVideoMock.mockResolvedValue({ outcome: 'too-large' });
    const client = new FakeCoreApiClient([buildCandidateNode()]);

    const result = await reconcileCallRecordingVideoArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { recordingRequestStatus: 'REQUESTED' },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
    expect(result.skippedTooLargeCount).toBe(1);
    expect(result.updatedCallRecordingCount).toBe(0);
    expect(result.deferredCallRecordingCount).toBe(1);
  });

  it('persists a transcript artifact independently from media', async () => {
    const transcript = [{ participant: { id: 1 }, words: [] }];

    reconcileCallRecordingTranscriptArtifactMock.mockResolvedValue({
      updateData: { transcript },
      requestedTranscript: false,
    });
    const client = new FakeCoreApiClient([buildCandidateNode()]);

    const result = await reconcileCallRecordingTranscriptArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(reconcileCallRecordingTranscriptArtifactMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      currentStatus: 'PROCESSING',
      externalRecordingId: 'recall-recording-1',
      requestedAt: '2026-01-01T14:10:00.000Z',
      transcript: undefined,
    });
    expect(client.lastQuery).toMatchObject({
      callRecordings: {
        __args: {
          filter: {
            and: [
              {
                or: [
                  { transcript: { is: 'NULL' } },
                  { transcript: { like: '%"status": "PENDING"%' } },
                ],
              },
              buildExpectedRecentCallRecordingFilter(NOW),
            ],
          },
          first: 25,
        },
      },
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { transcript },
      },
    ]);
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingCount: 1,
      requestedTranscriptCount: 0,
      skippedAlreadyFilledCount: 0,
      skippedMissingRecordingIdCount: 0,
      deferredCallRecordingCount: 0,
    });
  });

  it('keeps polling pending transcript markers', async () => {
    const pendingTranscriptMarker = {
      recallTranscriptId: 'recall-transcript-1',
      status: 'PENDING',
      requestedAt: '2026-01-01T14:10:00.000Z',
    };
    const transcript = [{ participant: { id: 1 }, words: [] }];

    reconcileCallRecordingTranscriptArtifactMock.mockResolvedValue({
      updateData: { transcript },
      requestedTranscript: false,
    });
    const client = new FakeCoreApiClient([
      buildCandidateNode({ transcript: pendingTranscriptMarker }),
    ]);

    await reconcileCallRecordingTranscriptArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.lastQuery).toMatchObject({
      callRecordings: {
        __args: {
          filter: {
            and: [
              {
                or: [
                  { transcript: { is: 'NULL' } },
                  { transcript: { like: '%"status": "PENDING"%' } },
                ],
              },
              buildExpectedRecentCallRecordingFilter(NOW),
            ],
          },
          first: 25,
        },
      },
    });
    expect(reconcileCallRecordingTranscriptArtifactMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      currentStatus: 'PROCESSING',
      externalRecordingId: 'recall-recording-1',
      requestedAt: '2026-01-01T14:10:00.000Z',
      transcript: pendingTranscriptMarker,
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { transcript },
      },
    ]);
  });

  it('defers pending transcript candidates when Recall is not ready yet', async () => {
    const pendingTranscriptMarker = {
      recallTranscriptId: 'recall-transcript-1',
      status: 'PENDING',
      requestedAt: '2026-01-01T14:10:00.000Z',
    };
    const client = new FakeCoreApiClient([
      buildCandidateNode({ transcript: pendingTranscriptMarker }),
    ]);

    const result = await reconcileCallRecordingTranscriptArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { recordingRequestStatus: 'REQUESTED' },
      },
    ]);
    expect(result.deferredCallRecordingCount).toBe(1);
    expect(result.updatedCallRecordingCount).toBe(0);
  });

  it('persists an audio artifact without touching video', async () => {
    ingestCallRecordingAudioMock.mockResolvedValue({
      outcome: 'uploaded',
      updateData: {
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      },
    });
    const client = new FakeCoreApiClient([buildCandidateNode()]);

    const result = await reconcileCallRecordingAudioArtifacts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(ingestCallRecordingAudioMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
    });
    expect(client.lastQuery).toMatchObject({
      callRecordings: {
        __args: {
          filter: {
            and: [
              { audio: { is: 'NULL' } },
              buildExpectedRecentCallRecordingFilter(NOW),
            ],
          },
          first: 10,
        },
      },
    });
    expect(ingestCallRecordingVideoMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }] },
      },
    ]);
    expect(result.updatedCallRecordingCount).toBe(1);
  });
});
