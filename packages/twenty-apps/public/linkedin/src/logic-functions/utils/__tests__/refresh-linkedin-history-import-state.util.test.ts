import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { type LinkedinHistoryImportChatProgress } from 'src/logic-functions/types/linkedin-history-import-chat-progress.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

const mocks = vi.hoisted(() => ({
  getJobs: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getJobs: mocks.getJobs,
  enqueueJobs: mocks.enqueueJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
    delete: async (key: string) => mocks.kvStore.delete(key),
  },
}));

const { refreshLinkedinHistoryImportState } =
  await import('src/logic-functions/utils/refresh-linkedin-history-import-state.util');

const STATE_KEY = 'linkedin-history-import:connection-id';
const PLANNING_KEY = 'linkedin-history-import-planning:connection-id:run-1';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const getChatKey = (chatId: string) =>
  `linkedin-history-import-chat:connection-id:run-1:${chatId}`;

const buildChat = (chatId: string): UnipileChat => ({
  id: chatId,
  name: chatId,
  is_group: false,
  is_1to1: true,
});

const buildContactsJob = ({
  chatId,
  attempt,
}: {
  chatId: string;
  attempt?: number;
}): LinkedinHistoryImportChatJob => ({
  kind: 'CONTACTS',
  payload: {
    connectedAccountId: 'connection-id',
    runId: 'run-1',
    chat: buildChat(chatId),
    attempt,
  },
});

const setChats = (
  progressByChatId: Record<string, LinkedinHistoryImportChatProgress>,
) => {
  mocks.kvStore.set(PLANNING_KEY, {
    chatIds: Object.keys(progressByChatId),
    planJobId: 'linkedin-history-plan-run-1-0',
  });
  Object.entries(progressByChatId).forEach(([chatId, progress]) =>
    mocks.kvStore.set(getChatKey(chatId), progress),
  );
};

const mockJobStates = (states: Record<string, string>) =>
  mocks.getJobs.mockImplementation(async (jobIds: string[]) =>
    jobIds
      .filter((jobId) => jobId in states)
      .map((jobId) => ({
        jobId,
        state: states[jobId],
        failedReason: states[jobId] === 'FAILED' ? 'Boom' : null,
      })),
  );

describe('refreshLinkedinHistoryImportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mockJobStates({
      'linkedin-history-plan-run-1-0': 'ACTIVE',
      'linkedin-history-contacts-run-1-chat-3-0': 'WAITING',
    });
  });

  it('shows a run still listing its conversations', async () => {
    mocks.kvStore.set(PLANNING_KEY, {
      planJobId: 'linkedin-history-plan-run-1-0',
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual({ ...RUNNING_STATE, resumeAt: undefined });
  });

  it('fails the run when its listing job is gone', async () => {
    mocks.kvStore.set(PLANNING_KEY, {
      planJobId: 'linkedin-history-plan-run-1-0',
    });
    mockJobStates({});

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
      }),
    );
  });

  it('fails a run whose planner from before this format already finished', async () => {
    mocks.kvStore.set(PLANNING_KEY, {
      plannedChunkCount: 3,
      plannedConversationCount: 45,
      chunkCount: 3,
      planJobId: 'linkedin-history-plan-run-1-0',
    });
    mockJobStates({ 'linkedin-history-plan-run-1-0': 'COMPLETED' });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
      }),
    );
  });

  it('does not count conversations still waiting for their contacts', async () => {
    setChats({
      'chat-1': { status: 'IMPORTED' },
      'chat-3': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-3' }),
      },
      'chat-4': { status: 'PENDING', chat: buildChat('chat-4') },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'IMPORTING',
        processedConversationCount: 1,
        totalConversationCount: 3,
      }),
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('restarts the contacts with the next waiting conversation once no contact job is left', async () => {
    mockJobStates({ 'linkedin-history-contacts-run-1-chat-1-0': 'FAILED' });
    setChats({
      'chat-1': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-1' }),
      },
      'chat-2': { status: 'PENDING', chat: buildChat('chat-2') },
      'chat-3': { status: 'PENDING', chat: buildChat('chat-3') },
    });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [
          expect.objectContaining({
            jobId: 'linkedin-history-contacts-run-1-chat-2-0',
          }),
        ],
      }),
    );
  });

  it('counts the conversations each job finished', async () => {
    setChats({
      'chat-1': { status: 'IMPORTED' },
      'chat-2': { status: 'SKIPPED' },
      'chat-3': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-3' }),
      },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual({
      ...RUNNING_STATE,
      importedConversationCount: 1,
      processedConversationCount: 2,
      totalConversationCount: 3,
      resumeAt: undefined,
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('shows when the import resumes once every pending conversation waits for a limit', async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 0, 1) });
    mockJobStates({
      'linkedin-history-contacts-run-1-chat-1-1': 'DELAYED',
      'linkedin-history-contacts-run-1-chat-2-1': 'DELAYED',
    });
    setChats({
      'chat-1': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-1', attempt: 1 }),
        resumeAt: '2026-01-01T02:00:00.000Z',
      },
      'chat-2': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-2', attempt: 1 }),
        resumeAt: '2026-01-01T01:00:00.000Z',
      },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({ resumeAt: '2026-01-01T01:00:00.000Z' }),
    );
  });

  it('completes the run once every conversation is done and clears its data', async () => {
    setChats({
      'chat-1': { status: 'IMPORTED' },
      'chat-2': {
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'x' },
      },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        importedConversationCount: 1,
        processedConversationCount: 2,
      }),
    );
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'COMPLETED' }),
    );
    expect(mocks.kvStore.has(PLANNING_KEY)).toBe(false);
    expect(mocks.kvStore.has(getChatKey('chat-1'))).toBe(false);
  });

  it('fails the run when no conversation could be imported', async () => {
    setChats({
      'chat-1': { status: 'SKIPPED' },
      'chat-2': {
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'x' },
      },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'x' },
      }),
    );
  });

  it('marks a conversation failed when its job failed', async () => {
    setChats({
      'chat-1': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-1' }),
      },
      'chat-2': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-2' }),
      },
    });
    mockJobStates({
      'linkedin-history-contacts-run-1-chat-1-0': 'FAILED',
      'linkedin-history-contacts-run-1-chat-2-0': 'ACTIVE',
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({ processedConversationCount: 1 }),
    );
    expect(mocks.kvStore.get(getChatKey('chat-1'))).toEqual({
      status: 'FAILED',
      error: { code: 'UNKNOWN', message: 'Boom' },
    });
  });

  it('queues again a conversation whose job ended without finishing it', async () => {
    mockJobStates({ 'linkedin-history-contacts-run-1-chat-1-0': 'COMPLETED' });
    setChats({
      'chat-1': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-1' }),
      },
    });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [
          expect.objectContaining({
            jobId: 'linkedin-history-contacts-run-1-chat-1-1',
          }),
        ],
      }),
    );
    expect(mocks.kvStore.get(getChatKey('chat-1'))).toEqual(
      expect.objectContaining({ status: 'IMPORTING', recoveryCount: 1 }),
    );
  });

  it('gives up on a conversation after three recoveries', async () => {
    mockJobStates({});
    setChats({
      'chat-1': {
        status: 'IMPORTING',
        job: buildContactsJob({ chatId: 'chat-1', attempt: 3 }),
        recoveryCount: 3,
      },
    });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
      }),
    );
  });

  it('leaves a run that is no longer importing as it is', async () => {
    const cancelledState = { ...RUNNING_STATE, status: 'CANCELLED' as const };

    mocks.kvStore.set(STATE_KEY, cancelledState);

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(cancelledState);
    expect(mocks.getJobs).not.toHaveBeenCalled();
  });
});
