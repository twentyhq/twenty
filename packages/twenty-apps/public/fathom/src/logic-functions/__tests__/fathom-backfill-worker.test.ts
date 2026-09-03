import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { MAX_FATHOM_BACKFILL_PAGES } from 'src/constants/fathom.constant';
import {
  FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const sdkMocks = vi.hoisted(() => ({
  enqueueJob: vi.fn(),
  getConnection: vi.fn(),
  keyValueStore: new Map<string, unknown>(),
  listMeetings: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: sdkMocks.enqueueJob,
  getConnection: sdkMocks.getConnection,
  kv: {
    get: async (key: string) => sdkMocks.keyValueStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      sdkMocks.keyValueStore.set(key, value);
    },
  },
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = sdkMocks.listMeetings;
  },
}));

const { fathomBackfillWorkerHandler } =
  await import('src/logic-functions/fathom-backfill-worker');

const NOW = Date.parse('2026-08-27T00:00:00.000Z');

const enqueuedJobs = () => sdkMocks.enqueueJob.mock.calls.map(([job]) => job);

const enqueuedBatchJobs = () =>
  enqueuedJobs().filter(
    (job) =>
      job.logicFunctionUniversalIdentifier ===
      FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  );

const enqueuedContinuationJobs = () =>
  enqueuedJobs().filter(
    (job) =>
      job.logicFunctionUniversalIdentifier ===
      FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  );

describe('fathomBackfillWorkerHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sdkMocks.keyValueStore.clear();
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    sdkMocks.getConnection.mockResolvedValue({ accessToken: 'token' });
    sdkMocks.enqueueJob.mockResolvedValue({ enqueued: true });
  });

  it('continues through cursor pages and imports meetings from every recorder', async () => {
    sdkMocks.listMeetings.mockImplementation(
      buildFathomMeetingPages([
        [
          buildFathomMeeting({ recordingId: 1 }),
          buildFathomMeeting({
            recordingId: 2,
            recorderEmail: 'teammate@example.com',
          }),
        ],
        [buildFathomMeeting({ recordingId: 3 })],
      ]),
    );

    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connection-1',
      days: 30,
    });

    const [continuationJob] = enqueuedContinuationJobs();

    expect(continuationJob).toEqual({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload: {
        connectedAccountId: 'connection-1',
        createdAfter: '2026-07-28T00:00:00.000Z',
        cursor: '1',
        pageIndex: 1,
      },
      retryLimit: 3,
      delayMs: 20_000,
    });

    await fathomBackfillWorkerHandler(continuationJob.payload);

    expect(sdkMocks.listMeetings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        createdAfter: '2026-07-28T00:00:00.000Z',
        cursor: '1',
      }),
    );
    expect(
      enqueuedBatchJobs().flatMap((job) =>
        job.payload.meetings.map(
          (meeting: { recordingId: number }) => meeting.recordingId,
        ),
      ),
    ).toEqual([1, 2, 3]);
    expect(enqueuedContinuationJobs()).toHaveLength(1);
  });

  it('staggers the batches of one page and places a later backfill after them', async () => {
    const meetings = Array.from({ length: 12 }, (_, index) =>
      buildFathomMeeting({ recordingId: index + 1 }),
    );

    sdkMocks.listMeetings
      .mockImplementationOnce(buildFathomMeetingPages([meetings]))
      .mockImplementationOnce(
        buildFathomMeetingPages([[buildFathomMeeting({ recordingId: 99 })]]),
      );

    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connection-1',
      days: 7,
    });
    await fathomBackfillWorkerHandler({
      connectedAccountId: 'connection-1',
      days: 30,
    });

    expect(enqueuedBatchJobs().map((job) => job.delayMs)).toEqual([
      0, 20_000, 40_000, 60_000,
    ]);
  });

  it('ends a cycling cursor chain at the page bound without failing the job', async () => {
    sdkMocks.listMeetings.mockResolvedValue({
      result: {
        items: [buildFathomMeeting({ recordingId: 1 })],
        limit: null,
        nextCursor: 'a',
      },
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(
      await fathomBackfillWorkerHandler({
        connectedAccountId: 'connection-1',
        createdAfter: '2026-08-20T00:00:00.000Z',
        cursor: 'b',
        pageIndex: MAX_FATHOM_BACKFILL_PAGES - 1,
      }),
    ).toEqual(expect.objectContaining({ hasMoreMeetings: false }));
    expect(enqueuedContinuationJobs()).toHaveLength(0);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('stopped after'),
    );
  });
});
