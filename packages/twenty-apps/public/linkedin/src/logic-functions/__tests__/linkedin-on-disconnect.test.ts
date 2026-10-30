import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
  getConnection: vi.fn(),
  removeLinkedinConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet },
  getConnection: mocks.getConnection,
}));

vi.mock(
  'src/logic-functions/utils/remove-linkedin-connection-resources.util',
  () => ({
    removeLinkedinConnectionResources: mocks.removeLinkedinConnectionResources,
  }),
);

const { linkedinOnDisconnectHandler } =
  await import('src/logic-functions/linkedin-on-disconnect');

const PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'linkedin',
  connectedAccountId: 'connection-id',
};

describe('linkedinOnDisconnectHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes the Unipile account recorded on connect', async () => {
    mocks.kvGet.mockResolvedValue('acc_1');

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(mocks.getConnection).not.toHaveBeenCalled();
    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });
  });

  it('falls back to the connection account when connect never completed', async () => {
    mocks.kvGet.mockResolvedValue(null);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_2' });

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_2',
    });
  });

  it('still cleans up the channel once the connection is gone', async () => {
    mocks.kvGet.mockResolvedValue(null);
    mocks.getConnection.mockRejectedValue(new Error('Connection not found'));

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });
  });
});
