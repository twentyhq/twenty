import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  listUnipileInboxIds: vi.fn(),
  listUnipileChatIds: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  AppConnectionAuthFailedError: class extends Error {},
  RetryableLogicFunctionError: class RetryableLogicFunctionError extends Error {},
  getConnection: mocks.getConnection,
  enqueueJobs: mocks.enqueueJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

vi.mock('src/unipile/utils/list-unipile-inbox-ids.util', () => ({
  listUnipileInboxIds: mocks.listUnipileInboxIds,
}));

vi.mock('src/unipile/utils/list-unipile-chat-ids.util', () => ({
  listUnipileChatIds: mocks.listUnipileChatIds,
}));

const { linkedinPlanHistoryImportHandler } =
  await import('src/logic-functions/linkedin-plan-history-import');

const STATE_KEY = 'linkedin-history-import:connection-id';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const PAYLOAD = { connectedAccountId: 'connection-id', runId: 'run-1' };

const buildChatIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `chat-${index}`);

describe('linkedinPlanHistoryImportHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listUnipileInboxIds.mockResolvedValue(['inbox-1']);
  });

  it('queues one job per chunk of 20 chats, most recent chunk first', async () => {
    mocks.listUnipileChatIds.mockResolvedValue(buildChatIds(45));

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      chunkCount: 3,
    });

    const [{ jobs }] = mocks.enqueueJobs.mock.calls[0];

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(jobs.map((job: { jobId: string }) => job.jobId)).toEqual([
      'linkedin-history-chunk-run-1-0',
      'linkedin-history-chunk-run-1-1',
      'linkedin-history-chunk-run-1-2',
    ]);
    expect(jobs[0].payload.chatIds).toEqual(buildChatIds(20));
    expect(jobs[2].payload.chatIds).toEqual([
      'chat-40',
      'chat-41',
      'chat-42',
      'chat-43',
      'chat-44',
    ]);
    expect(mocks.kvStore.get(STATE_KEY)).toEqual({
      ...RUNNING_STATE,
      totalConversationCount: 45,
      chunkCount: 3,
    });
  });

  it('adds the jobs in bulk batches of at most 200', async () => {
    mocks.listUnipileChatIds.mockResolvedValue(buildChatIds(20 * 250));

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(
      mocks.enqueueJobs.mock.calls.map(([input]) => input.jobs.length),
    ).toEqual([200, 50]);
  });

  it('completes a run with no conversations right away', async () => {
    mocks.listUnipileChatIds.mockResolvedValue([]);

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'COMPLETED', chunkCount: 0 }),
    );
  });

  it('queues nothing for a cancelled run', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.listUnipileChatIds).not.toHaveBeenCalled();
  });

  it('closes the run as failed on an error Twenty will not retry', async () => {
    mocks.listUnipileChatIds.mockRejectedValue({
      status: 400,
      title: 'Invalid querystring',
    });

    await expect(
      linkedinPlanHistoryImportHandler(PAYLOAD, {
        retryCount: 0,
        maxRetries: 3,
      }),
    ).rejects.toThrow('Invalid querystring');
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'Invalid querystring' },
      }),
    );
  });
});
