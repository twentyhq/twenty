import { kv } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { type GranolaWebhookEndpoint } from 'src/logic-functions/types/granola-api.type';
import { GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { reconcileGranolaPersonalWebhookOrThrow } from 'src/logic-functions/utils/reconcile-granola-personal-webhook-or-throw.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: vi.fn(), set: vi.fn() },
}));

vi.mock('src/logic-functions/utils/load-granola-personal-sync.util', () => ({
  loadGranolaPersonalSync: vi.fn(),
}));

const FOLDER_ID = 'fol_customerCalls1';
const NOW = new Date('2026-11-19T07:00:00.000Z');
const SCOPE = {
  connectionId: OWN_CONNECTION.id,
  userWorkspaceId: '89112069-0314-49ac-91e9-bddf995f8da1',
};
const KEY = getGranolaPersonalWebhookKey(SCOPE.connectionId);
const SYNC = {
  selection: [{ folderId: FOLDER_ID, selectedAt: NOW.toISOString() }],
  apiKey: 'grn_test',
  apiKeyFingerprint: 'a'.repeat(64),
};
const INPUT = {
  scope: SCOPE,
  apiKeyFingerprint: SYNC.apiKeyFingerprint,
  folderIds: [FOLDER_ID],
  selection: SYNC.selection,
};

const buildProvider = () => {
  const endpoints = new Map<string, GranolaWebhookEndpoint>();
  let endpointCount = 0;
  type Client = ReturnType<typeof createGranolaClientOrThrow>;

  const client = {
    listWebhookEndpoints: vi.fn<Client['listWebhookEndpoints']>(async () => ({
      webhook_endpoints: [...endpoints.values()],
    })),
    createWebhookEndpoint: vi.fn<Client['createWebhookEndpoint']>(
      async ({ url, folder_ids, scopes, events }) => {
        const endpoint: GranolaWebhookEndpoint = {
          id: `whe_${++endpointCount}`,
          object: 'webhook_endpoint',
          url,
          url_redacted: false,
          events: events ?? [],
          folder_ids: folder_ids ?? [],
          scopes,
          created_by: null,
          enabled: true,
          created_at: new Date().toISOString(),
        };

        endpoints.set(endpoint.id, endpoint);

        return { ...endpoint, signing_secret: 'whsec_candidate' };
      },
    ),
    updateWebhookEndpoint: vi.fn<Client['updateWebhookEndpoint']>(),
    deleteWebhookEndpoint: vi.fn<Client['deleteWebhookEndpoint']>(
      async ({ webhookEndpointId }) => {
        endpoints.delete(webhookEndpointId);

        return {
          id: webhookEndpointId,
          object: 'webhook_endpoint',
          deleted: true,
        };
      },
    ),
  };

  return { client, endpoints };
};

const entries = new Map<string, unknown>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubEnv('TWENTY_API_URL', 'https://twenty.example.com');
  vi.mocked(loadGranolaPersonalSync).mockResolvedValue(SYNC);
  vi.mocked(kv.get).mockImplementation(async (key) => entries.get(key) ?? null);
  vi.mocked(kv.set).mockImplementation(async (key, value) => {
    entries.set(key, value);
  });
});

afterEach(() => {
  entries.clear();
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('reconcileGranolaPersonalWebhookOrThrow', () => {
  it('updates the existing endpoint when the selected folders change', async () => {
    const { client } = buildProvider();

    await reconcileGranolaPersonalWebhookOrThrow({ ...INPUT, client });
    const registration = GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA.parse(
      entries.get(KEY),
    );
    const folderIds = ['fol_partnerCalls12'];
    const selection = [
      { folderId: folderIds[0], selectedAt: NOW.toISOString() },
    ];
    vi.mocked(loadGranolaPersonalSync).mockResolvedValue({
      ...SYNC,
      selection,
    });

    await expect(
      reconcileGranolaPersonalWebhookOrThrow({
        ...INPUT,
        client,
        folderIds,
        selection,
      }),
    ).resolves.toEqual({ skipped: false });

    expect(client.createWebhookEndpoint).toHaveBeenCalledOnce();
    expect(client.updateWebhookEndpoint).toHaveBeenCalledWith({
      webhookEndpointId: registration.webhookEndpointId,
      enabled: true,
      folder_ids: folderIds,
    });
    expect(entries.get(KEY)).toEqual(registration);
  });

  it('does not create an endpoint when the route claim fails', async () => {
    const { client, endpoints } = buildProvider();
    const claimError = new Error('Claim failed');
    vi.mocked(kv.set).mockRejectedValueOnce(claimError);

    await expect(
      reconcileGranolaPersonalWebhookOrThrow({ ...INPUT, client }),
    ).rejects.toBe(claimError);

    expect(entries.has(KEY)).toBe(false);
    expect(client.createWebhookEndpoint).not.toHaveBeenCalled();
    expect(endpoints.size).toBe(0);
  });

  it('preserves an endpoint when registration was stored despite the failed response', async () => {
    const { client, endpoints } = buildProvider();
    const responseError = new Error('Registration response was lost');
    vi.mocked(kv.set).mockImplementation(async (key, value) => {
      entries.set(key, value);

      if (key === KEY) {
        throw responseError;
      }
    });

    await expect(
      reconcileGranolaPersonalWebhookOrThrow({ ...INPUT, client }),
    ).rejects.toBe(responseError);

    const active = GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA.parse(
      entries.get(KEY),
    );

    expect([...endpoints.keys()]).toEqual([active.webhookEndpointId]);
    expect(client.deleteWebhookEndpoint).not.toHaveBeenCalled();
  });

  it('discards a new endpoint when the saved folders change during registration', async () => {
    const { client, endpoints } = buildProvider();
    vi.mocked(loadGranolaPersonalSync)
      .mockResolvedValueOnce(SYNC)
      .mockResolvedValue({
        ...SYNC,
        selection: [
          { ...SYNC.selection[0], selectedAt: '2026-11-19T07:01:00.000Z' },
        ],
      });

    await expect(
      reconcileGranolaPersonalWebhookOrThrow({ ...INPUT, client }),
    ).resolves.toEqual({ skipped: true });

    expect(entries.has(KEY)).toBe(false);
    expect(client.deleteWebhookEndpoint).toHaveBeenCalledOnce();
    expect(endpoints.size).toBe(0);
  });
});
