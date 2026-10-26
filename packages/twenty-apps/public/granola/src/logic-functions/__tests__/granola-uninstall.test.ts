import { afterEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { granolaUninstallHandler } from 'src/logic-functions/granola-uninstall';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';

const { kvStore } = vi.hoisted(() => ({ kvStore: new Map<string, unknown>() }));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: {
    get: vi.fn(async (key: string) => kvStore.get(key)),
    delete: vi.fn(async (key: string) => {
      kvStore.delete(key);
    }),
  },
}));

afterEach(() => {
  kvStore.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('granolaUninstallHandler', () => {
  it('uninstalls without calling Granola when no API key was saved', async () => {
    vi.stubEnv(GRANOLA_API_KEY_ENV_VAR_NAME, '');
    const mockedFetch = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', mockedFetch);

    await expect(granolaUninstallHandler()).resolves.toEqual({
      deletedWebhookCount: 0,
    });
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('clears a leftover registration when the API key was removed', async () => {
    vi.stubEnv(GRANOLA_API_KEY_ENV_VAR_NAME, '');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    kvStore.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
      registrationId: 'registration-id',
      webhookEndpointId: 'whe_example',
    });

    await expect(granolaUninstallHandler()).resolves.toEqual({
      deletedWebhookCount: 0,
    });
    expect(kvStore.has(GRANOLA_WEBHOOK_REGISTRATION_KEY)).toBe(false);
  });
});
