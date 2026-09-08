import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const sdkMocks = vi.hoisted(() => ({
  deleteWebhook: vi.fn(),
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  kvDelete: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: sdkMocks.kvGet, set: sdkMocks.kvSet, delete: sdkMocks.kvDelete },
  enqueueJobs: sdkMocks.enqueueJobs,
  getConnection: sdkMocks.getConnection,
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    deleteWebhook = sdkMocks.deleteWebhook;
  },
}));

const { fathomDisconnectHandler } =
  await import('src/logic-functions/fathom-disconnect');

const payload = {
  connectionProviderId: 'provider-1',
  connectionProviderName: 'fathom',
  connectedAccountId: 'connection-1',
};

const registration = {
  webhookId: 'webhook-1',
  secret: 'secret',
  isActive: true,
  isInitialBackfillEnqueued: true,
};

const MEDIA_CLEANUP_JOB = {
  logicFunctionUniversalIdentifier:
    FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
  payloads: [{ disconnectedAccountId: 'connection-1' }],
  retryLimit: 3,
};

describe('fathomDisconnectHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sdkMocks.kvGet.mockResolvedValue(registration);
    sdkMocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    sdkMocks.getConnection.mockResolvedValue({
      id: 'connection-1',
      accessToken: 'token-1',
    });
  });

  it('deletes the Fathom webhook, the registration and the server claim', async () => {
    expect(await fathomDisconnectHandler(payload)).toEqual({ success: true });
    expect(sdkMocks.deleteWebhook).toHaveBeenCalledWith({ id: 'webhook-1' });
    expect(sdkMocks.kvDelete.mock.calls).toEqual([
      ['fathom-webhook:connection-1'],
      ['fathom-connection:connection-1', { scope: 'SERVER' }],
    ]);
  });

  it('schedules the media cleanup for the disconnected account', async () => {
    expect(await fathomDisconnectHandler(payload)).toEqual({ success: true });
    expect(sdkMocks.enqueueJobs).toHaveBeenCalledWith(MEDIA_CLEANUP_JOB);
  });

  it('releases the server claim when no webhook was ever registered', async () => {
    sdkMocks.kvGet.mockResolvedValue(null);

    expect(await fathomDisconnectHandler(payload)).toEqual({ success: true });
    expect(sdkMocks.enqueueJobs).toHaveBeenCalledWith(MEDIA_CLEANUP_JOB);
    expect(sdkMocks.getConnection).not.toHaveBeenCalled();
    expect(sdkMocks.deleteWebhook).not.toHaveBeenCalled();
    expect(sdkMocks.kvDelete.mock.calls).toEqual([
      ['fathom-connection:connection-1', { scope: 'SERVER' }],
    ]);
  });

  it('completes the cleanup when Fathom already dropped the webhook', async () => {
    sdkMocks.deleteWebhook.mockRejectedValue(buildFathomNotFoundError());

    expect(await fathomDisconnectHandler(payload)).toEqual({ success: true });
    expect(sdkMocks.kvDelete).toHaveBeenCalledTimes(2);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('keeps the inactive registration and logs the leaked webhook when Fathom fails', async () => {
    sdkMocks.deleteWebhook.mockRejectedValue(new Error('Fathom unavailable'));

    await expect(fathomDisconnectHandler(payload)).rejects.toThrow(
      'Fathom unavailable',
    );
    expect(sdkMocks.enqueueJobs).toHaveBeenCalledWith(MEDIA_CLEANUP_JOB);
    expect(sdkMocks.kvSet).toHaveBeenCalledWith('fathom-webhook:connection-1', {
      ...registration,
      isActive: false,
    });
    expect(sdkMocks.kvDelete).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('leaked webhook webhook-1'),
    );
  });

  it('skips the webhook deletion when the media cleanup cannot be scheduled', async () => {
    sdkMocks.enqueueJobs.mockResolvedValue({ enqueued: false });

    await expect(fathomDisconnectHandler(payload)).rejects.toThrow(
      'Failed to enqueue Fathom job',
    );
    expect(sdkMocks.deleteWebhook).not.toHaveBeenCalled();
    expect(sdkMocks.kvDelete).not.toHaveBeenCalled();
  });
});
