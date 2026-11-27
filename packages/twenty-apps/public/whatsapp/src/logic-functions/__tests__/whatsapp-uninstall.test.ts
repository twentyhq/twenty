import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  removeWhatsappConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineUninstallLogicFunction: (config: unknown) => config,
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

const { whatsappUninstallHandler } =
  await import('src/logic-functions/whatsapp-uninstall');

describe('whatsappUninstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('removes the resources of every WhatsApp connection', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-1', externalAccountId: 'acc_1' },
      { id: 'connection-2', externalAccountId: 'acc_2' },
    ]);

    await expect(whatsappUninstallHandler()).resolves.toEqual({
      removedConnectionCount: 2,
    });
    expect(mocks.listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'whatsapp',
    });
    expect(mocks.removeWhatsappConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-1',
      unipileAccountId: 'acc_1',
    });
    expect(mocks.removeWhatsappConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-2',
      unipileAccountId: 'acc_2',
    });
    expect(mocks.removeWhatsappConnectionResources).toHaveBeenCalledTimes(2);
  });

  it('cleans up the other connections, then fails so the uninstall is retried', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-1', externalAccountId: 'acc_1' },
      { id: 'connection-2', externalAccountId: 'acc_2' },
    ]);
    mocks.removeWhatsappConnectionResources.mockRejectedValueOnce(
      new Error('Unipile is down'),
    );

    await expect(whatsappUninstallHandler()).rejects.toThrow(
      'WhatsApp cleanup failed for connections connection-1',
    );
    expect(mocks.removeWhatsappConnectionResources).toHaveBeenCalledTimes(2);
  });
});
