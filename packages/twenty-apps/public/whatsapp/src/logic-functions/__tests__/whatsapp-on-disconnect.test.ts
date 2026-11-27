import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  removeWhatsappConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
}));

vi.mock(
  'src/logic-functions/utils/remove-whatsapp-connection-resources.util',
  () => ({
    removeWhatsappConnectionResources: mocks.removeWhatsappConnectionResources,
  }),
);

const { whatsappOnDisconnectHandler } =
  await import('src/logic-functions/whatsapp-on-disconnect');

const PAYLOAD = {
  connectionProviderId: 'provider-id',
  connectionProviderName: 'whatsapp',
  connectedAccountId: 'connection-id',
};

describe('whatsappOnDisconnectHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes the Unipile account of the connection', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'other-connection-id', externalAccountId: 'acc_2' },
      { id: 'connection-id', externalAccountId: 'acc_1' },
    ]);

    await whatsappOnDisconnectHandler(PAYLOAD);

    expect(mocks.listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'whatsapp',
    });
    expect(
      mocks.removeWhatsappConnectionResources,
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

    await whatsappOnDisconnectHandler(PAYLOAD);

    expect(
      mocks.removeWhatsappConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: 'acc_1',
    });
  });

  it('still removes the channel once the connection is gone', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await whatsappOnDisconnectHandler(PAYLOAD);

    expect(
      mocks.removeWhatsappConnectionResources,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connection-id',
      unipileAccountId: null,
    });
  });

  it('fails when the connections cannot be listed', async () => {
    mocks.listConnections.mockRejectedValue(new Error('Network error'));

    await expect(whatsappOnDisconnectHandler(PAYLOAD)).rejects.toThrow(
      'Network error',
    );
    expect(mocks.removeWhatsappConnectionResources).not.toHaveBeenCalled();
  });
});
