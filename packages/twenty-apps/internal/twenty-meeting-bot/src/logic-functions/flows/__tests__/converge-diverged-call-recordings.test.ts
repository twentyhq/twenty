import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';

const getRecallBotMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/get-recall-bot.util', () => ({
  getRecallBot: getRecallBotMock,
}));

const NOW = new Date('2026-06-10T12:00:00.000Z');

type CallRecordingNode = Record<string, unknown>;

class FakeCoreApiClient {
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(private callRecordingNodes: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    const callRecordingFilter = query.callRecordings.__args.filter
      .or[0] as Record<string, any>;
    const requestedRecordingRequestStatus =
      callRecordingFilter.recordingRequestStatus.eq;
    const requestedCallRecordingStatuses = callRecordingFilter.status.in;
    const requiresExternalBotId =
      callRecordingFilter.externalBotId.is === 'NOT_NULL';
    const matchingCallRecordingNodes = this.callRecordingNodes.filter(
      (callRecordingNode) =>
        callRecordingNode.recordingRequestStatus ===
          requestedRecordingRequestStatus &&
        requestedCallRecordingStatuses.includes(callRecordingNode.status) &&
        (!requiresExternalBotId ||
          (callRecordingNode.externalBotId !== null &&
            callRecordingNode.externalBotId !== undefined)),
    );

    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: matchingCallRecordingNodes.map((node) => ({ node })),
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

const buildClient = (callRecordingNodes: CallRecordingNode[]) =>
  new FakeCoreApiClient(callRecordingNodes);

const buildStuckRecordingNode = (
  overrides: CallRecordingNode = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'RECORDING',
  recordingRequestStatus: 'REQUESTED',
  startedAt: null,
  endedAt: null,
  externalBotId: 'recall-bot-1',
  externalRecordingId: null,
  createdAt: '2026-06-09T12:00:00.000Z',
  calendarEvent: { endsAt: '2026-06-09T13:00:00.000Z' },
  ...overrides,
});

describe('convergeDivergedCallRecordings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getRecallBotMock.mockReset();
  });

  it('fills timestamps and recording id for a stuck RECORDING record from the Recall bot state', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:30.000Z' },
          { code: 'call_ended', created_at: '2026-06-09T14:00:30.000Z' },
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'PROCESSING',
          startedAt: '2026-06-09T13:02:00.000Z',
          endedAt: '2026-06-09T14:00:00.000Z',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingIds: ['call-recording-1'],
      markedFailedCallRecordingIds: [],
      unconvergeableCallRecordingIds: [],
    });
  });

  it('converges a SCHEDULED record when Recall moved forward but webhooks were missed', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'joining_call', created_at: '2026-06-09T13:01:00.000Z' },
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ status: 'SCHEDULED' }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'RECORDING',
          startedAt: '2026-06-09T13:02:00.000Z',
        },
      },
    ]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('skips records whose meeting may still be live', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: { endsAt: '2026-06-10T11:50:00.000Z' },
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.candidateCount).toBe(1);
  });

  it('marks FAILED_UNKNOWN without clearing the bot id when Recall returns 404', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: 404,
      errorMessage: 'Recall API responded with HTTP 404',
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { status: 'FAILED_UNKNOWN' },
      },
    ]);
    expect(result.markedFailedCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not select COMPLETED records as convergence candidates', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: 404,
      errorMessage: 'Recall API responded with HTTP 404',
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'COMPLETED',
        startedAt: '2026-06-09T13:02:00.000Z',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.candidateCount).toBe(0);
    expect(result.unconvergeableCallRecordingIds).toEqual([]);
    expect(getRecallBotMock).not.toHaveBeenCalled();
  });

  it('logs candidates whose meeting ended before the lookback bound instead of converging them', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: { endsAt: '2026-06-01T13:00:00.000Z' },
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('converges candidates created long before a recently ended meeting', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        createdAt: '2026-06-01T12:00:00.000Z',
        startedAt: '2026-06-09T13:02:00.000Z',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(result.unconvergeableCallRecordingIds).toEqual([]);
  });

  it('applies the downgrade guard to pulled statuses while still filling timestamps', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [
          { id: 'recall-recording-1', started_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ status: 'PROCESSING' }),
    ]);

    await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          startedAt: '2026-06-09T13:02:00.000Z',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
  });

  it('does not mutate a record the bot state agrees with', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ startedAt: '2026-06-09T13:02:00.000Z' }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
  });
});
