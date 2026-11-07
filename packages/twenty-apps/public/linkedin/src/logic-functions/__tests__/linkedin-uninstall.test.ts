import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  removeLinkedinConnectionResources: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineUninstallLogicFunction: (config: unknown) => config,
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

const { linkedinUninstallHandler } =
  await import('src/logic-functions/linkedin-uninstall');

describe('linkedinUninstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('removes the resources of every LinkedIn connection', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-1', externalAccountId: 'acc_1' },
      { id: 'connection-2', externalAccountId: 'acc_2' },
    ]);

    await expect(linkedinUninstallHandler()).resolves.toEqual({
      removedConnectionCount: 2,
    });
    expect(mocks.listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'linkedin',
    });
    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-1',
      unipileAccountId: 'acc_1',
    });
    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledWith({
      connectedAccountId: 'connection-2',
      unipileAccountId: 'acc_2',
    });
    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledTimes(2);
  });

  it('cleans up the other connections, then fails so the uninstall is retried', async () => {
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-1', externalAccountId: 'acc_1' },
      { id: 'connection-2', externalAccountId: 'acc_2' },
    ]);
    mocks.removeLinkedinConnectionResources.mockRejectedValueOnce(
      new Error('Unipile is down'),
    );

    await expect(linkedinUninstallHandler()).rejects.toThrow(
      'LinkedIn cleanup failed for connections connection-1',
    );
    expect(mocks.removeLinkedinConnectionResources).toHaveBeenCalledTimes(2);
  });
});
