import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';

const { enqueueJobsMock, getJobsMock } = vi.hoisted(() => ({
  enqueueJobsMock: vi.fn(),
  getJobsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
  getJobs: getJobsMock,
}));

const NOW = new Date('2026-06-10T12:00:00.000Z');

type Candidate = {
  id: string;
  status: string;
  calendarEvent?: { startsAt: string };
};

type EnqueuedBatch = {
  logicFunctionUniversalIdentifier: string;
  payloads: Record<string, unknown>[];
};

const buildClient = (nodes: Candidate[]) => ({
  query: vi.fn(
    async (query: {
      callRecordings: { __args: { first: number; after?: string } };
    }) => {
      const { first, after } = query.callRecordings.__args;
      const startIndex =
        after === undefined ? 0 : nodes.findIndex(({ id }) => id === after) + 1;
      const page = nodes.slice(startIndex, startIndex + first);

      return {
        callRecordings: {
          edges: page.map((node) => ({ node })),
          pageInfo: {
            hasNextPage: startIndex + first < nodes.length,
            endCursor: page[page.length - 1]?.id,
          },
        },
      };
    },
  ),
  mutation: vi.fn(),
});

const queuedBatches = (): EnqueuedBatch[] =>
  enqueueJobsMock.mock.calls.map(([batch]) => ({
    ...batch,
    payloads:
      batch.payloads ??
      batch.jobs.map(
        (job: { payload: Record<string, unknown> }) => job.payload,
      ),
  }));

describe('convergeDivergedCallRecordings', () => {
  beforeEach(() => {
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
    getJobsMock.mockReset().mockResolvedValue([]);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('Recovery must not download provider artifacts');
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('does nothing when the workspace has no candidates', async () => {
    const client = buildClient([]);
    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result).toEqual({ candidateCount: 0, enqueuedCallRecordingIds: [] });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('dispatches transcript, audio and video independently', async () => {
    const client = buildClient([{ id: 'recording-1', status: 'PROCESSING' }]);

    await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(queuedBatches().flatMap(({ payloads }) => payloads)).toEqual(
      ['transcript', 'audio', 'video'].map((scope) => ({
        callRecordingId: 'recording-1',
        requestedAt: NOW.toISOString(),
        scope,
      })),
    );
    expect(client.mutation).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { suffix: '-expired', state: 'ACTIVE' },
    { suffix: '-recovery-2026-06-10', state: 'ACTIVE' },
    { suffix: '-recovery-2026-06-09', state: 'ACTIVE' },
    { suffix: '-recovery-2026-06-10', state: 'WAITING' },
    { suffix: '-recovery-2026-06-10', state: 'DELAYED' },
  ])(
    'leaves $state $suffix imports to the queue',
    async ({ suffix, state }) => {
      const client = buildClient([{ id: 'recording-1', status: 'PROCESSING' }]);
      const activeJobIds = new Set(
        ['transcript', 'audio', 'video'].map(
          (scope) => `call-recorder-recording-1-${scope}${suffix}`,
        ),
      );

      getJobsMock.mockImplementation(async (jobIds: string[]) =>
        jobIds
          .filter((jobId) => activeJobIds.has(jobId))
          .map((jobId) => ({ jobId, state })),
      );

      await convergeDivergedCallRecordings({
        client: client as unknown as CoreApiClient,
        now: NOW,
      });

      expect(enqueueJobsMock).not.toHaveBeenCalled();
      expect(client.mutation).not.toHaveBeenCalled();
    },
  );

  it('reaches every recording across pages, even when earlier recordings remain processing', async () => {
    const nodes = Array.from({ length: 225 }, (_, index) => ({
      id: `recording-${index}`,
      status: 'PROCESSING',
    }));
    const client = buildClient(nodes);
    const runPage = (after?: string) =>
      convergeDivergedCallRecordings({
        client: client as unknown as CoreApiClient,
        now: NOW,
        after,
      });

    await runPage();
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(
      queuedBatches().flatMap(({ payloads }) =>
        payloads.filter(({ scope }) => scope === 'transcript'),
      ),
    ).toHaveLength(100);

    for (
      let batchIndex = 0;
      batchIndex < queuedBatches().length;
      batchIndex++
    ) {
      const batch = queuedBatches()[batchIndex];

      if (
        batch.logicFunctionUniversalIdentifier ===
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
      ) {
        const after = batch.payloads[0].after;
        expect(typeof after).toBe('string');
        if (typeof after === 'string') await runPage(after);
      }
    }

    const importedIds = queuedBatches()
      .filter(
        ({ logicFunctionUniversalIdentifier }) =>
          logicFunctionUniversalIdentifier ===
          IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      )
      .flatMap(({ payloads }) =>
        payloads
          .filter(({ scope }) => scope === 'video')
          .map(({ callRecordingId }) => callRecordingId),
      );

    expect(importedIds).toEqual(nodes.map(({ id }) => id));
    expect(client.query).toHaveBeenCalledTimes(3);
    expect(
      queuedBatches().every(({ payloads }) => payloads.length <= 200),
    ).toBe(true);
    expect(
      getJobsMock.mock.calls.every(([jobIds]) => jobIds.length <= 200),
    ).toBe(true);
  });

  it('recovers processing recordings without a bot id or a recent meeting date', async () => {
    const client = buildClient([
      {
        id: 'old-recording',
        status: 'PROCESSING',
        calendarEvent: { startsAt: '2025-01-01T00:00:00Z' },
      },
    ]);
    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.enqueuedCallRecordingIds).toEqual(['old-recording']);
    expect(client.query.mock.calls[0][0].callRecordings.__args).toMatchObject({
      filter: {
        or: expect.arrayContaining([{ status: { eq: 'PROCESSING' } }]),
      },
      orderBy: [{ id: 'AscNullsLast' }],
    });
  });

  it('enqueues lifecycle reconciliation separately and leaves future meetings alone', async () => {
    const client = buildClient([
      { id: 'recording', status: 'RECORDING' },
      { id: 'completed', status: 'COMPLETED' },
      {
        id: 'future',
        status: 'SCHEDULED',
        calendarEvent: { startsAt: '2026-06-11T00:00:00Z' },
      },
    ]);

    await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(queuedBatches()).toEqual([
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [
          { callRecordingId: 'recording' },
          { callRecordingId: 'completed' },
        ],
      }),
    ]);
  });

  it('propagates enqueue failure instead of silently reporting recovery success', async () => {
    enqueueJobsMock.mockRejectedValueOnce(new Error('Queue unavailable'));
    const client = buildClient([{ id: 'recording', status: 'PROCESSING' }]);

    await expect(
      convergeDivergedCallRecordings({
        client: client as unknown as CoreApiClient,
        now: NOW,
      }),
    ).rejects.toThrow('Queue unavailable');
  });

  it('rejects a non-advancing cursor instead of enqueueing an endless scan', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        callRecordings: {
          edges: [],
          pageInfo: { hasNextPage: true, endCursor: 'same' },
        },
      }),
    };

    await expect(
      convergeDivergedCallRecordings({
        client: client as unknown as CoreApiClient,
        now: NOW,
        after: 'same',
      }),
    ).rejects.toThrow('invalid next cursor');
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
