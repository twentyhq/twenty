import { ConnectionError } from 'fathom-typescript/sdk/models/errors';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';

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
    mocks.getConnection.mockResolvedValue({
      id: 'connection-1',
      accessToken: 'token-1',
    });
  });

  it.each([
    { description: 'a Fathom outage', error: buildFathomServerError() },
    {
      description: 'a network failure',
      error: new ConnectionError('connection refused'),
    },
  ])(
    'asks the platform to retry the page after $description',
    async ({ error }) => {
      mocks.listMeetings.mockRejectedValue(error);

      await expect(fathomBackfillWorkerHandler(PAYLOAD)).rejects.toBeInstanceOf(
        RetryableLogicFunctionError,
      );
      expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    },
  );

  it('does not retry a page Fathom rejects permanently', async () => {
    const notFoundError = buildFathomNotFoundError();

    mocks.listMeetings.mockRejectedValue(notFoundError);

    await expect(fathomBackfillWorkerHandler(PAYLOAD)).rejects.toBe(
      notFoundError,
    );
  });
});
