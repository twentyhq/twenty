import { listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OTHER_CONNECTION,
  OWN_CONNECTION,
} from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { granolaUninstallHandler } from 'src/logic-functions/granola-uninstall';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';

const { kvStore } = vi.hoisted(() => ({ kvStore: new Map<string, unknown>() }));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  listConnections: vi.fn(),
  kv: {
    get: vi.fn(async (key: string) => kvStore.get(key)),
    delete: vi.fn(async (key: string) => {
      kvStore.delete(key);
    }),
  },
}));

const deletedEndpointResponse = (webhookEndpointId: string) =>
  new Response(
    JSON.stringify({
      id: webhookEndpointId,
      object: 'webhook_endpoint',
      deleted: true,
    }),
    { status: 200 },
  );

beforeEach(() => {
  vi.mocked(listConnections).mockResolvedValue([]);
});

afterEach(() => {
  kvStore.clear();
  vi.clearAllMocks();
  vi.restoreAllMocks();
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

  it("removes every member's personal webhook with that member's key", async () => {
    vi.stubEnv(GRANOLA_API_KEY_ENV_VAR_NAME, '');
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      { ...OTHER_CONNECTION, accessToken: 'grn_other_member' },
    ]);
    kvStore.set(getGranolaPersonalWebhookKey(OWN_CONNECTION.id), {
      webhookEndpointId: 'whe_own',
    });
    kvStore.set(getGranolaPersonalWebhookKey(OTHER_CONNECTION.id), {
      webhookEndpointId: 'whe_other',
    });
    kvStore.set(getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id), [
      { folderId: 'fol_own', selectedAt: '2026-11-20T08:57:45.754Z' },
    ]);
    const mockedFetch = vi.fn<typeof fetch>(async (input) =>
      deletedEndpointResponse(
        String(input).endsWith('whe_own') ? 'whe_own' : 'whe_other',
      ),
    );
    vi.stubGlobal('fetch', mockedFetch);

    await granolaUninstallHandler();

    const deletions = mockedFetch.mock.calls.map(([input, init]) => ({
      url: String(input),
      method: init?.method,
      authorization: new Headers(init?.headers).get('Authorization'),
    }));

    expect(deletions).toEqual(
      expect.arrayContaining([
        {
          url: 'https://public-api.granola.ai/v1/webhook-endpoints/whe_own',
          method: 'DELETE',
          authorization: 'Bearer grn_personal_test',
        },
        {
          url: 'https://public-api.granola.ai/v1/webhook-endpoints/whe_other',
          method: 'DELETE',
          authorization: 'Bearer grn_other_member',
        },
      ]),
    );
    expect(kvStore.has(getGranolaPersonalWebhookKey(OWN_CONNECTION.id))).toBe(
      false,
    );
    expect(kvStore.has(getGranolaPersonalWebhookKey(OTHER_CONNECTION.id))).toBe(
      false,
    );
    expect(
      kvStore.has(getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id)),
    ).toBe(false);
  });

  it('still clears the workspace registration when personal connections cannot be listed', async () => {
    vi.stubEnv(GRANOLA_API_KEY_ENV_VAR_NAME, '');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(listConnections).mockRejectedValue(new Error('unavailable'));
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
