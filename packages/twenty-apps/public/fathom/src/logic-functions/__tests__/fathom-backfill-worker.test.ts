import { isNonEmptyArray } from '@sniptt/guards';
import { ConnectionError } from 'fathom-typescript/sdk/models/errors';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomRateLimitError } from 'src/__tests__/utils/build-fathom-rate-limit-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';
import { MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS } from 'src/constants/fathom.constant';
import {
  FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  listMeetings: vi.fn(),
  query: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
  getConnection: mocks.getConnection,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {
    query = mocks.query;
  },
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = mocks.listMeetings;
  },
}));

const { fathomBackfillWorkerHandler } =
  await import('src/logic-functions/fathom-backfill-worker');

const PAYLOAD = { connectedAccountId: 'connection-1', days: 31 };

const MEETINGS = [1, 2, 3].map((recordingId) =>
  buildFathomMeeting({ recordingId }),
);
const [DELETED_ID, COMPLETED_ID, NEW_ID] = MEETINGS.map((meeting) =>
  computeCallRecordingIdForFathomMeeting(meeting.recordingId),
);

const buildCompletedNode = (id: string) => ({
  id,
  updatedAt: '2026-08-20T11:00:00.000Z',
  deletedAt: null,
  status: 'COMPLETED',
  recordingRequestStatus: 'REQUESTED',
  startedAt: '2026-08-20T10:00:00.000Z',
  endedAt: '2026-08-20T10:30:00.000Z',
  calendarEventId: 'calendar-event-id',
  video: [{ fileId: 'video-file-id' }],
  audio: [],
  summary: { markdown: 'Summary' },
  fathomRecordingImports: {
    edges: [{ node: { id, updatedAt: '2026-08-20T11:00:00.000Z' } }],
  },
});

type CallRecordingFilter = {
  deletedAt?: { is: string };
  or?: Array<Record<string, unknown>>;
};

describe('fathomBackfillWorkerHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.getConnection.mockResolvedValue({
      id: 'connection-1',
      accessToken: 'token-1',
    });
  });

  it.each([
    {
      description: 'a rate limit',
      error: buildFathomRateLimitError('120'),
      expectedDelay: 120_000,
    },
    {
      description: 'a Fathom outage',
      error: buildFathomServerError(),
      expectedDelay: 60_000,
    },
    {
      description: 'a network failure',
      error: new ConnectionError('connection refused'),
      expectedDelay: 60_000,
    },
  ])(
    're-enqueues the same page after $description',
    async ({ error, expectedDelay }) => {
      mocks.listMeetings.mockRejectedValue(error);

      expect(
        await fathomBackfillWorkerHandler({
          ...PAYLOAD,
          cursor: 'cursor-3',
          pageIndex: 3,
          requeueAttempt: 1,
        }),
      ).toMatchObject({ success: true, requeueDelay: expectedDelay });
      expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          logicFunctionUniversalIdentifier:
            FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
          payloads: [
            {
              connectedAccountId: 'connection-1',
              createdAfter: expect.any(String),
              cursor: 'cursor-3',
              pageIndex: 3,
              requeueAttempt: 2,
            },
          ],
          delayMs: expectedDelay,
        }),
      );
    },
  );

  it('keeps the original window when re-enqueueing a page', async () => {
    mocks.listMeetings.mockRejectedValue(buildFathomServerError());

    const { createdAfter } = await fathomBackfillWorkerHandler(PAYLOAD);

    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        payloads: [expect.objectContaining({ createdAfter })],
      }),
    );
  });

  it('asks the platform to retry when re-enqueueing the page fails', async () => {
    mocks.listMeetings.mockRejectedValue(buildFathomRateLimitError('120'));
    mocks.enqueueJobs.mockResolvedValue({ enqueued: false });

    await expect(fathomBackfillWorkerHandler(PAYLOAD)).rejects.toBeInstanceOf(
      RetryableLogicFunctionError,
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledOnce();
  });

  it('asks the platform to retry once the re-enqueue budget is spent', async () => {
    mocks.listMeetings.mockRejectedValue(buildFathomRateLimitError('120'));

    await expect(
      fathomBackfillWorkerHandler({
        ...PAYLOAD,
        requeueAttempt: MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS,
      }),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('drops deleted and already complete recordings from the page with one read', async () => {
    const deletedNode = {
      ...buildCompletedNode(DELETED_ID),
      deletedAt: '2026-08-21T00:00:00.000Z',
    };
    const completedNode = buildCompletedNode(COMPLETED_ID);

    mocks.listMeetings.mockImplementation(buildFathomMeetingPages([MEETINGS]));
    mocks.query.mockImplementation(
      async ({
        callRecordings,
      }: {
        callRecordings: { __args: { filter: CallRecordingFilter } };
      }) => {
        const filter = callRecordings.__args.filter;
        const nodes =
          filter.deletedAt?.is === 'NOT_NULL'
            ? [deletedNode]
            : isNonEmptyArray(filter.or)
              ? [deletedNode, completedNode]
              : [];

        return { callRecordings: { edges: nodes.map((node) => ({ node })) } };
      },
    );

    expect(await fathomBackfillWorkerHandler(PAYLOAD)).toMatchObject({
      discoveredMeetingCount: 3,
      skippedDeletedMeetingCount: 1,
      skippedUpToDateMeetingCount: 1,
      enqueuedBatchCount: 1,
    });
    expect(mocks.query).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              id: { in: [DELETED_ID, COMPLETED_ID, NEW_ID] },
              or: [
                { deletedAt: { is: 'NOT_NULL' } },
                {
                  status: { eq: 'COMPLETED' },
                  transcript: { like: '[_%]' },
                },
              ],
            },
          }),
        }),
      }),
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
        payloads: [
          {
            connectedAccountId: 'connection-1',
            meetings: [serializeFathomMeeting(MEETINGS[2])],
          },
        ],
      }),
    );
  });

  it('does not retry a page Fathom rejects permanently', async () => {
    const notFoundError = buildFathomNotFoundError();

    mocks.listMeetings.mockRejectedValue(notFoundError);

    await expect(fathomBackfillWorkerHandler(PAYLOAD)).rejects.toBe(
      notFoundError,
    );
  });
});
