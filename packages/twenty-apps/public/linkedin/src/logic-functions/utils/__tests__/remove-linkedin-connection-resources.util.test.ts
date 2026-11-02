import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listMessageChannels: vi.fn(),
  deleteMessageChannel: vi.fn(),
  kvDelete: vi.fn(),
  kvGet: vi.fn(),
  deleteUnipileAccountOrThrow: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listMessageChannels: mocks.listMessageChannels,
  deleteMessageChannel: mocks.deleteMessageChannel,
  kv: { delete: mocks.kvDelete, get: mocks.kvGet },
}));

vi.mock('src/unipile/utils/delete-unipile-account-or-throw.util', () => ({
  deleteUnipileAccountOrThrow: mocks.deleteUnipileAccountOrThrow,
}));

const { removeLinkedinConnectionResources } =
  await import('src/logic-functions/utils/remove-linkedin-connection-resources.util');

describe('removeLinkedinConnectionResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listMessageChannels.mockResolvedValue([{ id: 'channel-id' }]);
    mocks.kvGet.mockResolvedValue(null);
  });

  it('clears the pages and progress of the last import run', async () => {
    mocks.kvGet.mockImplementation(async (key: string) => {
      if (key === 'linkedin-history-import:connection-id') {
        return { runId: 'run-1' };
      }

      return key.startsWith('linkedin-history-import-planning:')
        ? { plannedChunkCount: 2, plannedConversationCount: 40 }
        : null;
    });

    await removeLinkedinConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });

    expect(mocks.kvDelete.mock.calls.map(([key]) => key)).toEqual(
      expect.arrayContaining([
        'linkedin-history-import-progress:connection-id:run-1',
        'linkedin-history-import-planning:connection-id:run-1',
        'linkedin-history-import-chats:connection-id:run-1:0',
        'linkedin-history-import-chats:connection-id:run-1:1',
      ]),
    );
  });

  it('deletes the channel, the sync state, the Unipile account and the routing claim', async () => {
    await removeLinkedinConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });

    expect(mocks.deleteMessageChannel).toHaveBeenCalledExactlyOnceWith(
      'channel-id',
    );
    expect(mocks.deleteUnipileAccountOrThrow).toHaveBeenCalledExactlyOnceWith(
      'acc_1',
    );
    expect(mocks.kvDelete.mock.calls).toEqual([
      ['linkedin-settings:connection-id'],
      ['linkedin-history-import:connection-id'],
      ['unipile-account:acc_1', { scope: 'SERVER' }],
    ]);
  });

  it('only deletes the channel and the sync state when the Unipile account is unknown', async () => {
    await removeLinkedinConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });

    expect(mocks.deleteMessageChannel).toHaveBeenCalledExactlyOnceWith(
      'channel-id',
    );
    expect(mocks.deleteUnipileAccountOrThrow).not.toHaveBeenCalled();
    expect(mocks.kvDelete).toHaveBeenCalledTimes(2);
    expect(mocks.kvDelete).not.toHaveBeenCalledWith(
      'unipile-account:acc_1',
      expect.anything(),
    );
  });
});
