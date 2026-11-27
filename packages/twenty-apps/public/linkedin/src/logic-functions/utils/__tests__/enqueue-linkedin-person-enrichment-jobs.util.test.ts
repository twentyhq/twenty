import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  enqueueJobs: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: mocks.enqueueJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
  },
}));

const { buildLinkedinProfileHandle } =
  await import('src/logic-functions/utils/build-linkedin-profile-handle.util');

const { enqueueLinkedinPersonEnrichmentJobs } =
  await import('src/logic-functions/utils/enqueue-linkedin-person-enrichment-jobs.util');

const PRIYA = {
  id: 'priya-provider-id',
  display_name: 'Priya Shah',
  public_identifier: 'priya-shah',
};

const MARCUS = {
  id: 'marcus-provider-id',
  display_name: 'Marcus Lee',
  public_identifier: 'marcus-lee',
};

const enqueue = () =>
  enqueueLinkedinPersonEnrichmentJobs({
    unipileAccountId: 'unipile-account-id',
    counterparts: [PRIYA, MARCUS, PRIYA],
    personIdByHandle: new Map([
      [buildLinkedinProfileHandle(PRIYA), 'priya-id'],
      [buildLinkedinProfileHandle(MARCUS), 'marcus-id'],
    ]),
  });

describe('enqueueLinkedinPersonEnrichmentJobs', () => {
  beforeEach(() => {
    mocks.kvStore.clear();
    mocks.enqueueJobs.mockReset().mockResolvedValue({ enqueued: true });
  });

  it('queues one rate-limited job per person not enriched yet', async () => {
    mocks.kvStore.set('linkedin-enriched-person:marcus-id', true);

    await enqueue();

    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        limiter: { max: 10, durationMs: 60_000 },
        jobs: [
          {
            jobId: expect.stringMatching(
              /^linkedin-enrich-person-priya-id-\d{4}-\d{2}-\d{2}$/,
            ),
            payload: {
              unipileAccountId: 'unipile-account-id',
              personId: 'priya-id',
              providerUserId: 'priya-provider-id',
            },
          },
        ],
      }),
    );
  });

  it('never fails the sync when the jobs cannot be queued', async () => {
    mocks.enqueueJobs.mockRejectedValue(new Error('queue is full'));

    await expect(enqueue()).resolves.toBeUndefined();
  });
});
