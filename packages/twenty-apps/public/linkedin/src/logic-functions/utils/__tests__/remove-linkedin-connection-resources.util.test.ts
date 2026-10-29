import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listMessageChannels: vi.fn(),
  deleteMessageChannel: vi.fn(),
  kvDelete: vi.fn(),
  deleteUnipileAccount: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listMessageChannels: mocks.listMessageChannels,
  deleteMessageChannel: mocks.deleteMessageChannel,
  kv: { delete: mocks.kvDelete },
}));

vi.mock('src/unipile/utils/delete-unipile-account.util', () => ({
  deleteUnipileAccount: mocks.deleteUnipileAccount,
}));

const { removeLinkedinConnectionResources } =
  await import('src/logic-functions/utils/remove-linkedin-connection-resources.util');

describe('removeLinkedinConnectionResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listMessageChannels.mockResolvedValue([{ id: 'channel-id' }]);
  });

  it('deletes the channel, the Unipile account and the routing claim', async () => {
    await removeLinkedinConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });

    expect(mocks.deleteMessageChannel).toHaveBeenCalledWith('channel-id');
    expect(mocks.deleteUnipileAccount).toHaveBeenCalledWith('acc_1');
    expect(mocks.kvDelete).toHaveBeenCalledWith('unipile-account:acc_1', {
      scope: 'SERVER',
    });
    expect(mocks.kvDelete).toHaveBeenCalledWith(
      'linkedin-unipile-account:connection-id',
    );
  });

  it('only deletes the channel when the Unipile account is unknown', async () => {
    await removeLinkedinConnectionResources({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });

    expect(mocks.deleteMessageChannel).toHaveBeenCalledWith('channel-id');
    expect(mocks.deleteUnipileAccount).not.toHaveBeenCalled();
    expect(mocks.kvDelete).toHaveBeenCalledTimes(1);
  });
});
