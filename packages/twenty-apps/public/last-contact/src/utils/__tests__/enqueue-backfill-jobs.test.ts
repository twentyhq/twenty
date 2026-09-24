import { expect, it, vi } from 'vitest';

const { queryMock, enqueueJobMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  enqueueJobMock: vi.fn().mockResolvedValue({ enqueued: true }),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

vi.mock('src/utils/backfill-settings', () => ({
  getBackfillBatchSize: () => 200,
  getBackfillSleepMs: () => 1_000,
}));

import backfillLastContact from 'src/logic-functions/backfill-last-contact';

it('allows a manual backfill and reuses distinct job IDs for each phase and batch', async () => {
  queryMock.mockImplementation(async (query) => ({
    [Object.keys(query)[0]]: { totalCount: 201 },
  }));

  const handler = backfillLastContact.config.handler as (
    payload: object,
  ) => Promise<object>;

  await handler({});

  const firstRunJobs = enqueueJobMock.mock.calls.map(([job]) => job);

  expect(firstRunJobs.map((job) => job.jobId)).toEqual([
    'last-contact-backfill-people-200-0',
    'last-contact-backfill-people-200-1',
    'last-contact-backfill-opportunities-200-0',
    'last-contact-backfill-opportunities-200-1',
    'last-contact-backfill-companies-200-0',
    'last-contact-backfill-companies-200-1',
  ]);

  enqueueJobMock.mockClear();
  await handler({});

  expect(enqueueJobMock.mock.calls.map(([job]) => job)).toEqual(firstRunJobs);
});
