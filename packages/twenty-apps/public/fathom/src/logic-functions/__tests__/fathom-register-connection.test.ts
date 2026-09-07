import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const sdkMocks = vi.hoisted(() => ({
  createWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: sdkMocks.kvGet, set: sdkMocks.kvSet },
  enqueueJobs: sdkMocks.enqueueJobs,
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

const failRegistrationWrite = (error: Error) => {
  let hasFailed = false;

  sdkMocks.kvSet.mockImplementation((key: string) => {
    if (hasFailed || !key.startsWith('fathom-webhook:')) {
      return Promise.resolve();
    }

    hasFailed = true;

    return Promise.reject(error);
  });
};

const INACTIVE_REGISTRATION = {
  webhookId: 'stale-webhook',
  secret: 'secret',
  isActive: false,
  isInitialBackfillEnqueued: true,
};

const ACTIVE_REGISTRATION = {
  ...INACTIVE_REGISTRATION,
  webhookId: 'existing-webhook',
  isActive: true,
};

const INITIAL_BACKFILL_JOB = {
  logicFunctionUniversalIdentifier: FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  payloads: [{ connectedAccountId: 'connection-1', days: 31 }],
  retryLimit: 3,
};

describe('fathomRegisterConnectionHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.TWENTY_API_URL = 'https://example.dev';
    sdkMocks.getConnection.mockResolvedValue({ accessToken: 'token' });
    sdkMocks.kvGet.mockResolvedValue(null);
    sdkMocks.createWebhook.mockResolvedValue({
      id: 'webhook-1',
      secret: 'secret-1',
    });
    sdkMocks.enqueueJobs.mockResolvedValue({ enqueued: true });
  });

  it('claims the connection and registers a webhook pointing at the server route', async () => {
    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'webhook-1',
    });
    expect(sdkMocks.kvSet).toHaveBeenCalledWith(
      'fathom-connection:connection-1',
      null,
      { scope: 'SERVER' },
    );
    expect(sdkMocks.createWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationUrl:
          'https://example.dev/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=connection-1',
      }),
    );
    expect(sdkMocks.kvSet).toHaveBeenCalledWith('fathom-webhook:connection-1', {
      webhookId: 'webhook-1',
      secret: 'secret-1',
      isActive: true,
      isInitialBackfillEnqueued: false,
    });
  });

  it('starts the initial import once the registration is stored', async () => {
    await fathomRegisterConnectionHandler(HOOK_PAYLOAD);

    expect(sdkMocks.enqueueJobs).toHaveBeenCalledWith(INITIAL_BACKFILL_JOB);
    expect(sdkMocks.kvSet).toHaveBeenLastCalledWith(
      'fathom-webhook:connection-1',
      expect.objectContaining({
        webhookId: 'webhook-1',
        isInitialBackfillEnqueued: true,
      }),
    );
  });

  it('enqueues the initial import on retry when the active registration is still missing it', async () => {
    sdkMocks.kvGet.mockResolvedValue({
      ...ACTIVE_REGISTRATION,
      isInitialBackfillEnqueued: false,
    });

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'existing-webhook',
    });
    expect(sdkMocks.createWebhook).not.toHaveBeenCalled();
    expect(sdkMocks.enqueueJobs).toHaveBeenCalledWith(INITIAL_BACKFILL_JOB);
    expect(sdkMocks.kvSet).toHaveBeenCalledWith('fathom-webhook:connection-1', {
      ...ACTIVE_REGISTRATION,
      isInitialBackfillEnqueued: true,
    });
  });

  it('asks the queue to retry when Fathom fails transiently', async () => {
    sdkMocks.createWebhook.mockRejectedValue(buildFathomServerError());

    await expect(
      fathomRegisterConnectionHandler(HOOK_PAYLOAD),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
  });

  it('surfaces a rejected webhook without retrying', async () => {
    sdkMocks.createWebhook.mockRejectedValue(buildFathomNotFoundError());

    await expect(
      fathomRegisterConnectionHandler(HOOK_PAYLOAD),
    ).rejects.not.toBeInstanceOf(RetryableLogicFunctionError);
  });

  it('deletes the webhook it just created when the registration cannot be stored', async () => {
    failRegistrationWrite(new Error('Key value store unavailable'));

    await expect(fathomRegisterConnectionHandler(HOOK_PAYLOAD)).rejects.toThrow(
      'Key value store unavailable',
    );
    expect(sdkMocks.deleteWebhook).toHaveBeenCalledWith({ id: 'webhook-1' });
  });

  it('keeps the webhook when the failed write turns out to have committed', async () => {
    failRegistrationWrite(new Error('Response lost'));
    sdkMocks.kvGet.mockResolvedValueOnce(null).mockResolvedValueOnce({
      webhookId: 'webhook-1',
      secret: 'secret-1',
      isActive: true,
      isInitialBackfillEnqueued: false,
    });

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'webhook-1',
    });
    expect(sdkMocks.deleteWebhook).not.toHaveBeenCalled();
  });

  it('reports the storage failure even when the created webhook cannot be deleted', async () => {
    failRegistrationWrite(new Error('Key value store unavailable'));
    sdkMocks.deleteWebhook.mockRejectedValue(new Error('Fathom unavailable'));

    await expect(fathomRegisterConnectionHandler(HOOK_PAYLOAD)).rejects.toThrow(
      'Key value store unavailable',
    );
  });

  it('reuses the webhook of an already active registration', async () => {
    sdkMocks.kvGet.mockResolvedValue(ACTIVE_REGISTRATION);

    expect(await fathomRegisterConnectionHandler(HOOK_PAYLOAD)).toEqual({
      success: true,
      webhookId: 'existing-webhook',
    });
    expect(sdkMocks.createWebhook).not.toHaveBeenCalled();
    expect(sdkMocks.enqueueJobs).not.toHaveBeenCalled();
    expect(sdkMocks.kvSet).not.toHaveBeenCalled();
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
