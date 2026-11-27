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

const { removeWhatsappConnectionResources } =
  await import('src/logic-functions/utils/remove-whatsapp-connection-resources.util');

describe('removeWhatsappConnectionResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listMessageChannels.mockResolvedValue([{ id: 'channel-id' }]);
    mocks.kvGet.mockResolvedValue(null);
  });

  it('clears the listed conversations of the last import run', async () => {
    mocks.kvGet.mockImplementation(async (key: string) => {
      if (key === 'whatsapp-history-import:connection-id') {
        return { runId: 'run-1' };
      }

      return key.startsWith('whatsapp-history-import-planning:')
        ? { chatIds: ['chat-1', 'chat-2'] }
        : null;
    });

    await removeWhatsappConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });

    expect(mocks.kvDelete.mock.calls.map(([key]) => key)).toEqual(
      expect.arrayContaining([
        'whatsapp-history-import-planning:connection-id:run-1',
        'whatsapp-history-import-chat:connection-id:run-1:chat-1',
        'whatsapp-history-import-chat:connection-id:run-1:chat-2',
      ]),
    );
  });

  it('deletes the channel, the sync state, the Unipile account and the routing claim', async () => {
    await removeWhatsappConnectionResources({
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
      ['whatsapp-settings:connection-id'],
      ['whatsapp-history-import:connection-id'],
      ['unipile-account:acc_1', { scope: 'SERVER' }],
    ]);
  });

  it('only deletes the channel and the sync state when the Unipile account is unknown', async () => {
    await removeWhatsappConnectionResources({
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
