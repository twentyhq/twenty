import { ConnectionError } from 'fathom-typescript/sdk/models/errors';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomRateLimitError } from 'src/__tests__/utils/build-fathom-rate-limit-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';
import { MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS } from 'src/constants/fathom.constant';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  listMeetings: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
  getConnection: mocks.getConnection,
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    listMeetings = mocks.listMeetings;
  },
}));

const { fathomBackfillWorkerHandler } =
  await import('src/logic-functions/fathom-backfill-worker');

const PAYLOAD = { connectedAccountId: 'connection-1', days: 31 };

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

  it('does not retry a page Fathom rejects permanently', async () => {
    const notFoundError = buildFathomNotFoundError();

    mocks.listMeetings.mockRejectedValue(notFoundError);

    await expect(fathomBackfillWorkerHandler(PAYLOAD)).rejects.toBe(
      notFoundError,
    );
  });
});
