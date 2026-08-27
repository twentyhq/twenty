import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';

const sdkMocks = vi.hoisted(() => ({
  createWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
  getConnection: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: sdkMocks.kvGet, set: sdkMocks.kvSet },
  getConnection: sdkMocks.getConnection,
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    createWebhook = sdkMocks.createWebhook;
    deleteWebhook = sdkMocks.deleteWebhook;
  },
}));

const { fathomRegisterConnectionHandler } =
  await import('src/logic-functions/fathom-register-connection');

const HOOK_PAYLOAD = {
  connectionProviderId: 'provider-1',
  connectionProviderName: 'fathom',
  connectedAccountId: 'connection-1',
};

const INACTIVE_REGISTRATION = {
  webhookId: 'stale-webhook',
  secret: 'secret',
  isActive: false,
};

describe('fathomRegisterConnectionHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.TWENTY_FUNCTIONS_URL = 'https://example.dev/s';
    sdkMocks.getConnection.mockResolvedValue({ accessToken: 'token' });
    sdkMocks.kvGet.mockResolvedValue(null);
    sdkMocks.createWebhook.mockResolvedValue({
      id: 'webhook-1',
      secret: 'secret-1',
    });
  });

  it('registers a webhook pointing at the connection-scoped route', async () => {
    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'webhook-1',
    });
    expect(sdkMocks.createWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationUrl:
          'https://example.dev/s/webhook/fathom?connectionId=connection-1',
      }),
    );
    expect(sdkMocks.kvSet).toHaveBeenCalledWith('fathom-webhook:connection-1', {
      webhookId: 'webhook-1',
      secret: 'secret-1',
      isActive: true,
    });
  });

  it('deletes the webhook it just created when the registration cannot be stored', async () => {
    sdkMocks.kvSet.mockRejectedValue(new Error('Key value store unavailable'));

    await expect(fathomRegisterConnectionHandler(HOOK_PAYLOAD)).rejects.toThrow(
      'Key value store unavailable',
    );
    expect(sdkMocks.deleteWebhook).toHaveBeenCalledWith({ id: 'webhook-1' });
  });

  it('keeps the webhook when the failed write turns out to have committed', async () => {
    sdkMocks.kvSet.mockRejectedValue(new Error('Response lost'));
    sdkMocks.kvGet.mockResolvedValueOnce(null).mockResolvedValueOnce({
      webhookId: 'webhook-1',
      secret: 'secret-1',
      isActive: true,
    });

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'webhook-1',
    });
    expect(sdkMocks.deleteWebhook).not.toHaveBeenCalled();
  });

  it('reports the storage failure even when the created webhook cannot be deleted', async () => {
    sdkMocks.kvSet.mockRejectedValue(new Error('Key value store unavailable'));
    sdkMocks.deleteWebhook.mockRejectedValue(new Error('Fathom unavailable'));

    await expect(fathomRegisterConnectionHandler(HOOK_PAYLOAD)).rejects.toThrow(
      'Key value store unavailable',
    );
  });

  it('reuses the webhook of an already active registration', async () => {
    sdkMocks.kvGet.mockResolvedValue({
      ...INACTIVE_REGISTRATION,
      webhookId: 'existing-webhook',
      isActive: true,
    });

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'existing-webhook',
    });
    expect(sdkMocks.createWebhook).not.toHaveBeenCalled();
  });

  it('replaces an inactive registration whose webhook Fathom already dropped', async () => {
    sdkMocks.kvGet.mockResolvedValue(INACTIVE_REGISTRATION);
    sdkMocks.deleteWebhook.mockRejectedValue(buildFathomNotFoundError());

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'webhook-1',
    });
    expect(sdkMocks.deleteWebhook).toHaveBeenCalledWith({
      id: 'stale-webhook',
    });
  });

  it('does not replace an inactive registration when its webhook cannot be deleted', async () => {
    sdkMocks.kvGet.mockResolvedValue(INACTIVE_REGISTRATION);
    sdkMocks.deleteWebhook.mockRejectedValue(new Error('Fathom unavailable'));

    await expect(fathomRegisterConnectionHandler(HOOK_PAYLOAD)).rejects.toThrow(
      'Fathom unavailable',
    );
    expect(sdkMocks.createWebhook).not.toHaveBeenCalled();
  });
});
