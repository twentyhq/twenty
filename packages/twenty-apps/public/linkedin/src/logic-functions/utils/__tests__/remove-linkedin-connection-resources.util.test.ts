import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listMessageChannels: vi.fn(),
  deleteMessageChannel: vi.fn(),
  kvDelete: vi.fn(),
  deleteUnipileAccountOrThrow: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listMessageChannels: mocks.listMessageChannels,
  deleteMessageChannel: mocks.deleteMessageChannel,
  kv: { delete: mocks.kvDelete },
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
