import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';

const sdkMocks = vi.hoisted(() => ({
  deleteWebhook: vi.fn(),
  kvDelete: vi.fn(),
  kvGet: vi.fn(),
  listConnections: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineUninstallLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: sdkMocks.kvGet, delete: sdkMocks.kvDelete },
  listConnections: sdkMocks.listConnections,
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    deleteWebhook = sdkMocks.deleteWebhook;
  },
}));

const { fathomUninstallHandler } =
  await import('src/logic-functions/fathom-uninstall');

const buildConnection = (id: string) => ({ id, accessToken: `token-${id}` });

const buildRegistration = (registrationKey: string) => ({
  webhookId: `webhook-for-${registrationKey}`,
  secret: 'secret',
  isActive: true,
});

describe('fathomUninstallHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sdkMocks.listConnections.mockResolvedValue([
      buildConnection('connection-1'),
      buildConnection('connection-2'),
    ]);
    sdkMocks.kvGet.mockImplementation((key: string) =>
      Promise.resolve(buildRegistration(key)),
    );
  });

  it('deletes the Fathom webhook of every connected account', async () => {
    expect(await fathomUninstallHandler()).toEqual({ deletedWebhookCount: 2 });
    expect(sdkMocks.deleteWebhook.mock.calls).toEqual([
      [{ id: 'webhook-for-fathom-webhook:connection-1' }],
      [{ id: 'webhook-for-fathom-webhook:connection-2' }],
    ]);
    expect(sdkMocks.kvDelete.mock.calls).toEqual([
      ['fathom-webhook:connection-1'],
      ['fathom-connection:connection-1', { scope: 'SERVER' }],
      ['fathom-webhook:connection-2'],
      ['fathom-connection:connection-2', { scope: 'SERVER' }],
    ]);
  });

  it('keeps deleting the remaining webhooks when Fathom rejects one', async () => {
    sdkMocks.deleteWebhook.mockRejectedValueOnce(
      new Error('Fathom unavailable'),
    );

    expect(await fathomUninstallHandler()).toEqual({ deletedWebhookCount: 1 });
    expect(sdkMocks.deleteWebhook).toHaveBeenNthCalledWith(2, {
      id: 'webhook-for-fathom-webhook:connection-2',
    });
    expect(sdkMocks.kvDelete).toHaveBeenCalledTimes(4);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('webhook-for-fathom-webhook:connection-1'),
    );
  });

  it('counts a webhook Fathom already dropped as deleted', async () => {
    sdkMocks.deleteWebhook.mockRejectedValueOnce(buildFathomNotFoundError());

    expect(await fathomUninstallHandler()).toEqual({ deletedWebhookCount: 2 });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('keeps cleaning the remaining connections when one KV read fails', async () => {
    sdkMocks.kvGet.mockRejectedValueOnce(
      new Error('Key value store unavailable'),
    );

    expect(await fathomUninstallHandler()).toEqual({ deletedWebhookCount: 1 });
    expect(sdkMocks.deleteWebhook).toHaveBeenCalledWith({
      id: 'webhook-for-fathom-webhook:connection-2',
    });
  });

  it('skips connections that never registered a webhook', async () => {
    sdkMocks.kvGet.mockResolvedValue(null);

    expect(await fathomUninstallHandler()).toEqual({ deletedWebhookCount: 0 });
    expect(sdkMocks.deleteWebhook).not.toHaveBeenCalled();
    expect(sdkMocks.kvDelete).not.toHaveBeenCalled();
  });
});
