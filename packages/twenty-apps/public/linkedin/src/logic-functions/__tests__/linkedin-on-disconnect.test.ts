import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  removeLinkedinConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
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

  it('removes the Unipile account of the connection', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'other-connection-id', externalAccountId: 'acc_2' },
      { id: 'connection-id', externalAccountId: 'acc_1' },
    ]);

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(mocks.listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'linkedin',
    });
    expect(
      mocks.removeLinkedinConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });
  });

  it('removes the Unipile account of a connection whose auth failed', async () => {
    mocks.listConnections.mockResolvedValue([
      {
        id: 'connection-id',
        externalAccountId: 'acc_1',
        authFailedAt: '2026-10-30T09:00:00.000Z',
      },
    ]);

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(
      mocks.removeLinkedinConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });
  });

  it('still removes the channel once the connection is gone', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await linkedinOnDisconnectHandler(PAYLOAD);

    expect(
      mocks.removeLinkedinConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });
  });

  it('fails when the connections cannot be listed', async () => {
    mocks.listConnections.mockRejectedValue(new Error('Network error'));

    await expect(linkedinOnDisconnectHandler(PAYLOAD)).rejects.toThrow(
      'Network error',
    );
    expect(mocks.removeLinkedinConnectionResources).not.toHaveBeenCalled();
  });
});
